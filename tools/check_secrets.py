#!/usr/bin/env python3
"""커밋 전에 비밀 값이 섞였는지 검사한다. 값 자체는 출력하지 않는다.

  python3 tools/check_secrets.py            # 스테이징된 파일 검사 (pre-commit 훅이 부른다)
  python3 tools/check_secrets.py --all      # 추적 중인 파일 전체 검사
"""
import base64, json, re, subprocess, sys

PATTERNS = {
    'Supabase 비밀 키': r'sb_secret_[A-Za-z0-9_-]{8,}',
    '개인 키': r'-----BEGIN [A-Z ]*PRIVATE KEY-----',
    '비밀번호가 든 DB 주소': r'postgres(?:ql)?://[^\s:/@]+:[^\s@]{3,}@',
    'GitHub 토큰': r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})',
    'AWS 키': r'\bAKIA[0-9A-Z]{16}\b',
    'Google API 키': r'\bAIza[0-9A-Za-z_-]{35}\b',
    'Google OAuth 비밀': r'\bGOCSPX-[A-Za-z0-9_-]{20,}',
    'Supabase 액세스 토큰': r'\bsbp_[a-f0-9]{30,}',
    '개인 이메일': r'\b[A-Za-z0-9._%+-]+@(?:gmail|naver|daum|hanmail|kakao|outlook|hotmail|skku)\.[a-z.]{2,8}\b',
}
JWT = r'\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
BAD_NAME = re.compile(r'(^|/)(\.env(\..*)?|.*\.(pem|key|p12|pfx)|id_rsa|credentials\.json|service[-_]account.*\.json)$')

def jwt_role(tok):
    try:
        p = tok.split('.')[1]; return json.loads(base64.urlsafe_b64decode(p + '=' * (-len(p) % 4))).get('role')
    except Exception: return None
def secret_kind(text):
    """비밀이면 종류 이름, 아니면 None. anon(공개용) JWT 와 publishable 키는 통과한다."""
    for name, rx in PATTERNS.items():
        if re.search(rx, text): return name
    for tok in re.findall(JWT, text):
        if jwt_role(tok) != 'anon': return 'JWT(role=%s)' % jwt_role(tok)
    return None

def main():
    git = lambda *a: subprocess.run(['git', *a], capture_output=True, check=True).stdout
    every = '--all' in sys.argv
    names = git('ls-files', '-z') if every else git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z')
    bad = []
    for n in filter(None, names.decode().split('\0')):
        if BAD_NAME.search(n) and not n.endswith('.example'): bad.append((n, 0, '커밋하면 안 되는 파일'))
        text = git('show', ':' + n).decode('utf-8', 'replace')
        for i, line in enumerate(text.split('\n'), 1):
            k = secret_kind(line)
            if k: bad.append((n, i, k))
    for n, i, k in bad: print(f'  {n}:{i}  {k}')
    if bad: print('비밀로 보이는 값이 있어 멈췄습니다. 값을 지우고, 이미 노출됐다면 폐기하고 새로 발급하세요.'); return 1
    return 0
if __name__ == '__main__': sys.exit(main())
