"""Собирает src/data/availability.json для вкладки «Наличие».

python build.py --date 2026-10-08 --towers towers.json:"ТАВЕРС.xlsx от 25.09.2026" --imperial imperial.json:"ИМПЕРИАЛ.xlsx от 25.09.2026"
На входе — вывод parse_chess.py (уже без персональных данных).
"""
import argparse, json, os, re

RULES = {
    # В Империале весь 1-й этаж — коммерция / не продаётся
    'imperial': lambda a: {**a, 'status': 'not_for_sale'} if a['floor'] == 1 and a['status'] == 'free' else a,
}


# Верхние этажи с особыми планировками: шахматка подставляет площади типового этажа,
# поэтому этаж пересобирается по позициям №1–7 (как в шаблонах планировок).
# status=None — статус берётся из шахматки по порядку номеров; pos_status — исключения по позиции.
FLOOR_OVERRIDES = {
    'imperial': {
        ('5', 15): {'apts': list(range(141, 148)), 'areas': [83.8, 86.2, 57.3, 57.6, 57.3, 86.2, 83.8], 'status': 'free'},
        ('5', 16): {'apts': list(range(148, 155)), 'areas': [68.65, 82.9, 45.7, 46.0, 45.7, 82.9, 68.65], 'status': 'free'},
        # 09.10.2026 со слов руководителя продаж: 13 этаж свободен весь, на 14-м №5 в брони
        ('2', 13): {'apts': None, 'areas': [79.8, 84.2, 54.8, 55.2, 54.8, 84.2, 79.8], 'status': 'free'},
        ('2', 14): {'apts': None, 'areas': [65.8, 81.0, 44.2, 44.6, 44.2, 81.0, 65.8], 'status': 'free',
                    'pos_status': {5: 'reserved'}},
    },
}


def apply_overrides(proj, apts):
    rules = FLOOR_OVERRIDES.get(proj, {})
    if not rules:
        return apts
    out = [a for a in apts if (a['block'], a['floor']) not in rules]
    for (block, floor), rule in rules.items():
        orig = sorted([a for a in apts if a['block'] == block and a['floor'] == floor],
                      key=lambda a: float(a['apt'].replace('/', '.')))
        nums = [str(n) for n in rule['apts']] if rule['apts'] else [a['apt'] for a in orig][:len(rule['areas'])]
        for i, area in enumerate(rule['areas']):
            status = rule.get('pos_status', {}).get(i + 1) or rule['status'] or (orig[i]['status'] if i < len(orig) else 'free')
            out.append({'block': block, 'floor': floor, 'apt': nums[i], 'area': area, 'status': status, 'pos': i + 1})
    return out


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
        apts = apply_overrides(proj, apts)
        out['projects'][proj] = {'source': source, 'skipped': d.get('skipped', []), 'apartments': apts}
    dst = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'availability.json')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('written', os.path.abspath(dst))


if __name__ == '__main__':
    main()
