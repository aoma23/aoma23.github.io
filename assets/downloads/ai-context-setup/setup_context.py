#!/usr/bin/env python3
"""Local, resumable interview for personal development context. Python 3.10+."""
import argparse
from datetime import date
import hashlib
import json
from pathlib import Path
import sys


QUESTIONS = [
    ('purpose', '自分と活動', 'どんなものを、誰のために作りたいですか？'),
    ('values', '考え方', 'ものづくりで大切にしたいことを3つ挙げるなら？'),
    ('reason', '考え方', 'その価値観を大切にするようになった経験や理由は？'),
    ('tradeoff', '考え方', '見た目・使いやすさ・速さ・保守性がぶつかったら、どう選びますか？'),
    ('exceptions', '考え方', 'その優先順位を変えるのは、どんな場面ですか？'),
    ('good_ux', 'UIとUX', '使いやすいと感じたアプリや操作は？どこが、なぜよかったですか？'),
    ('bad_ux', 'UIとUX', '使いにくいと感じた体験は？何を変えるとよくなりそうですか？'),
    ('first_use', 'UIとUX', '初めて使う人に、最初に何を迷わずできてほしいですか？'),
    ('accessibility', 'UIとUX', '文字の読みやすさ、キーボード操作、色、動きについて配慮したいことは？'),
    ('quality', '開発と確認', '開発を進めるときに守りたいことは？試作品と本番ではどう変わりますか？'),
    ('validation', '開発と確認', '「できた」「使いやすくなった」と判断するには何を確かめたいですか？'),
    ('collaboration', 'AIとの協働', 'AIにはどこまで任せ、どんな判断を自分に相談してほしいですか？'),
    ('feedback', 'AIとの協働', '提案や反対意見は、どのように伝えてもらいたいですか？'),
    ('project', 'プロジェクト', '今のプロジェクトの目的・対象ユーザー・制約・次に決めたいことは？'),
    ('review', '見直し', 'まだ迷っている価値観や、考え方を見直したい条件は？'),
]


def digest(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def documents(answers):
    today = date.today().isoformat()
    files = {}
    groups = {}
    for key, group, question in QUESTIONS:
        groups.setdefault(group, []).append((key, question))
    names = dict(zip(groups, ['profile.md', 'principles.md', 'ui-ux.md',
                             'development.md', 'collaboration.md', 'project.md', 'review.md']))
    for group, items in groups.items():
        body = [f'# {group}', '', f'生成日：{today}', '',
                '本人が入力した回答です。未回答から方針を推測しないでください。', '']
        for key, question in items:
            body += [f'## {question}', '', answers.get(key) or '（未回答・未決定）', '']
        files[names[group]] = '\n'.join(body)
    files['README.md'] = '''# 自分の開発コンテキスト

質問への回答から作った、自分の考え方と開発の判断基準です。
生成後に本人が内容を確認してから、AIへ共有してください。

- profile.md：活動と対象ユーザー
- principles.md：価値観、理由、トレードオフ、例外
- ui-ux.md：具体的な体験、初回利用、アクセシビリティ
- development.md：開発と完了の判断基準
- collaboration.md：AIへの委任と相談
- project.md：現在のプロジェクト
- review.md：迷っていることと見直し条件
- AGENTS.md / CLAUDE.md：AI向けの参照ルール

## 運用

各AIに関連ファイルを参照させ、作業後に更新候補と理由を出してもらいます。
確定した価値観と、一時的な条件・推測を区別してください。
プロジェクトごとの制約は、そのプロジェクト内でも管理してください。
個人の好みを、対象ユーザーにとっての使いやすさの根拠にしないでください。

## GitHubやチャットで使う

非公開リポジトリへ本人が内容を確認してから登録してください。
このツールはGitHub作成、アップロード、AI接続を自動実行しません。
ChatGPT・Claudeのチャットでは、必要な文書を添付するか、対応する連携で読み込みます。
接続後も毎回自動で読まれるとは限りません。参照した文書を報告してもらってください。
専用リポジトリの指示が別リポジトリにも適用されるとは限りません。
開発先のAI設定から、このリポジトリの場所と読む対象を明示してください。

## 再編集

同じ出力先でセットアップを再実行すると、空Enterで前の回答を維持できます。
生成文書を手動編集した場合は、上書きせず停止します。
その場合は別の出力先へ生成して差分を確認し、必要な内容を統合してください。
.context-state.jsonには回答が含まれます。Markdownだけ共有するなら、このファイルを除外します。
'''
    rules = '''# このコンテキストを使うAIへ

これは本人の判断を助ける参考情報です。現在の依頼と開発先のルールを確認してください。
着手前にREADME.mdと依頼に関連する文書だけを読み、参照した文書を報告してください。
ファイルを読めなかった場合は、読んだと推測せずその旨を伝えてください。
個人の好みとユーザー調査で確かめた事実を区別してください。
未回答を本人の方針として補完しないでください。
方針が競合した場合は、理由とトレードオフを示してください。
本人が明言した新しい判断は、理由・適用範囲・見直し条件とともに更新候補にしてください。
一時的な依頼やAIの推測を、恒久的な価値観として保存しないでください。
文書の更新は差分を示し、本人の確認後に行ってください。
実装の完了は、プロジェクトで定めた動作確認とユーザー体験の確認で判断してください。
'''
    files['AGENTS.md'] = rules
    files['CLAUDE.md'] = rules
    return files


def read_state(target):
    state_path = target / '.context-state.json'
    if state_path.is_symlink():
        raise ValueError('状態ファイルがシンボリックリンクのため停止します。')
    if not state_path.exists():
        return {'version': 1, 'answers': {}, 'generated': {}}
    state = json.loads(state_path.read_text(encoding='utf-8'))
    keys = {q[0] for q in QUESTIONS}
    if (state.get('version') != 1 or not isinstance(state.get('answers'), dict)
            or not isinstance(state.get('generated'), dict)
            or not all(k in keys and isinstance(v, str) for k, v in state['answers'].items())):
        raise ValueError('状態ファイルの形式を確認してください。')
    return state


def save(target, answers, previous):
    files = documents(answers)
    # Check every destination before writing any file; preserve manual changes.
    for name in files:
        p = target / name
        if p.is_symlink() or (p.exists() and (
                not p.is_file() or digest(p.read_text(encoding='utf-8')) != previous.get(name))):
            raise ValueError(f'{p} は既存・手動編集済みです。別の出力先を指定してください。')
    target.mkdir(parents=True, exist_ok=True)
    for name, content in files.items():
        (target / name).write_text(content, encoding='utf-8')
    state = {'version': 1, 'answers': answers,
             'generated': {name: digest(content) for name, content in files.items()}}
    (target / '.context-state.json').write_text(
        json.dumps(state, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description='質問に答えて、開発の判断基準をMarkdownにまとめます。')
    parser.add_argument('--output', type=Path, default=Path('my-ai-context'), help='出力先')
    args = parser.parse_args()
    try:
        state = read_state(args.output)
        answers = dict(state['answers'])
        print('開発コンテキストのセットアップ（外部送信・AIによる解釈は行いません）')
        print('空Enter: 前の回答を維持／未回答  :clear: 回答削除  :quit: ここまで保存して終了')
        print('迷っていることも、そのまま書けます。秘密情報は入力しないでください。\n')
        for i, (key, group, question) in enumerate(QUESTIONS, 1):
            print(f'[{i}/{len(QUESTIONS)} {group}] {question}')
            if key in answers:
                print('現在:', answers[key])
            try:
                value = input('> ').strip()
            except (EOFError, KeyboardInterrupt):
                print('\nここまでの回答を保存します。')
                break
            if value == ':quit':
                break
            if value == ':clear':
                answers.pop(key, None)
            elif value:
                answers[key] = value
        save(args.output, answers, state['generated'])
        print(f'保存しました: {args.output.resolve()}\nREADME.mdから内容を確認してください。')
    except (ValueError, OSError) as exc:
        print(f'保存できませんでした: {exc}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
