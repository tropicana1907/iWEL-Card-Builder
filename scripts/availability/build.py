"""Собирает src/data/availability.json для вкладки «Наличие».

python build.py --date 2026-10-08 --towers towers.json:"ТАВЕРС.xlsx от 25.09.2026" --imperial imperial.json:"ИМПЕРИАЛ.xlsx от 25.09.2026"
На входе — вывод parse_chess.py (уже без персональных данных).
"""
import argparse, json, os, re

RULES = {
    # В Империале весь 1-й этаж — коммерция / не продаётся
    'imperial': lambda a: {**a, 'status': 'not_for_sale'} if a['floor'] == 1 and a['status'] == 'free' else a,
}


def block_no(section):
    m = re.search(r'(\d+|[A-ZА-Я])\s*$', section.strip())
    return m.group(1) if m else section


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--date', required=True)
    ap.add_argument('--towers')
    ap.add_argument('--imperial')
    args = ap.parse_args()
    out = {'updatedAt': args.date, 'projects': {}}
    for proj in ('towers', 'imperial'):
        spec = getattr(args, proj)
        if not spec:
            continue
        path, source = spec.split(':', 1)
        d = json.load(open(path, encoding='utf-8'))
        rule = RULES.get(proj, lambda a: a)
        apts = []
        for a in d['apartments']:
            a = rule(a)
            apts.append({'block': block_no(a['section']), 'floor': a['floor'], 'apt': a['apt'],
                         'area': a['area'], 'status': a['status']})
        out['projects'][proj] = {'source': source, 'skipped': d.get('skipped', []), 'apartments': apts}
    dst = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'availability.json')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('written', os.path.abspath(dst))


if __name__ == '__main__':
    main()
