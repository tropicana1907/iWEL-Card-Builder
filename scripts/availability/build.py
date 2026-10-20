"""Собирает src/data/availability.json для вкладки «Наличие».

python build.py --date 2026-10-08 --towers towers.json:"ТАВЕРС.xlsx от 25.09.2026" --imperial imperial.json:"ИМПЕРИАЛ.xlsx от 25.09.2026"
На входе — вывод parse_chess.py (уже без персональных данных).
"""
import argparse, json, os, re

RULES = {
    # В Империале весь 1-й этаж — коммерция / не продаётся
    'imperial': lambda a: {**a, 'status': 'not_for_sale'} if a['floor'] == 1 else a,
}


# Верхние этажи с особыми планировками: шахматка подставляет площади типового этажа,
# поэтому этаж пересобирается по позициям №1–7 (как в шаблонах планировок).
# status=None — статус берётся из шахматки по порядку номеров; pos_status — исключения по позиции.
FLOOR_OVERRIDES = {
    'imperial': {
        ('5', 15): {'apts': list(range(141, 148)), 'areas': [83.8, 86.2, 57.3, 57.6, 57.3, 86.2, 83.8], 'status': None},
        ('5', 16): {'apts': list(range(148, 155)), 'areas': [68.65, 82.9, 45.7, 46.0, 45.7, 82.9, 68.65], 'status': None},
        ('2', 13): {'apts': None, 'areas': [79.8, 84.2, 54.8, 55.2, 54.8, 84.2, 79.8], 'status': None},
        ('2', 14): {'apts': None, 'areas': [65.8, 81.0, 44.2, 44.6, 44.2, 81.0, 65.8], 'status': None},
    },
}


# Особая раскладка блоков (статусы берутся из цвета клеток шахматки — parse_chess.py).
# Блок 4 Империала: 11 квартир на этаже по стоякам, 11–12 этажи закрыты.
BLOCK_STATUS = {
    'imperial': {
        '4': {
            'columns': [75.59, 48.54, 93.36, 45.3, 26.95, 26.68, 76.1, 53.45, 52.6, 32.23, 25.55],
            'closed_floors': {11, 12},
            # Стояки, поделённые на две квартиры (45,3 + 26,95 и 52,6 + 32,23): если в шахматке у большой
            # нет номера, номер соседки делим на /1 и /2, как кв. 4/1 и 4/2
            'pairs': [(3, 4), (8, 9)],
        },
    },
}


# Этажи, которых нет в шахматке и которые не продаются: (блок, этаж) → квартир на этаже.
# Показываем сплошными серыми клетками без номеров и площадей.
CLOSED_FLOORS = {
    'imperial': {('3', 11): 7, ('3', 12): 7},  # блок 3: 11–12 этажи (с террасами) закрыты, 09.10.2026
}


def add_closed_floors(proj, apts):
    out = [a for a in apts if (a['block'], a['floor']) not in CLOSED_FLOORS.get(proj, {})]
    for (block, floor), n in CLOSED_FLOORS.get(proj, {}).items():
        out += [{'block': block, 'floor': floor, 'apt': '', 'area': 0, 'status': 'not_for_sale', 'ord': i, 'hide': True}
                for i in range(n)]
    return out


def apply_block_status(proj, apts):
    rules = BLOCK_STATUS.get(proj, {})
    out = []
    for a in apts:
        r = rules.get(a['block'])
        if r:
            if a['floor'] in r.get('closed_floors', ()):
                a = {**a, 'status': 'not_for_sale', 'hide': True}
            elif a['floor'] == 1:
                a = {**a, 'status': 'not_for_sale'}
            if r.get('columns'):
                a['ord'] = min(range(len(r['columns'])), key=lambda i: abs(r['columns'][i] - a['area']))
        out.append(a)
    # Стояки без номера в шахматке (пустые цветные клетки) — показываем серой клеткой, чтобы на этаже было 11
    for block, r in rules.items():
        cols = r.get('columns')
        if not cols:
            continue
        floors = {a['floor'] for a in out if a['block'] == block and a['floor'] > 1 and a['floor'] not in r.get('closed_floors', ())}
        for fl in floors:
            have = {a['ord'] for a in out if a['block'] == block and a['floor'] == fl}
            for i, area in enumerate(cols):
                if i in have:
                    continue
                pair = next((p for p in r.get('pairs', ()) if p[0] == i), None)
                mate = pair and next((a for a in out if a['block'] == block and a['floor'] == fl and a.get('ord') == pair[1]), None)
                if mate and '/' not in mate['apt']:
                    n = mate['apt']
                    mate['apt'] = f'{n}/2'
                    out.append({**mate, 'apt': f'{n}/1', 'area': area, 'ord': i})
                else:
                    out.append({'block': block, 'floor': fl, 'apt': '', 'area': area, 'status': 'sold', 'ord': i, 'hide': True})
    return out


def apply_overrides(proj, apts):
    rules = FLOOR_OVERRIDES.get(proj, {})
    if not rules:
        return apts
    out = [a for a in apts if (a['block'], a['floor']) not in rules]
    for (block, floor), rule in rules.items():
        # Порядок клеток слева направо = позиции №1–7 (номер в клетке бывает записан с ошибкой, например «45» вместо 150)
        orig = [a for a in apts if a['block'] == block and a['floor'] == floor]
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
    ap.add_argument('--azur-prime', dest='azur_prime')
    args = ap.parse_args()
    out = {'updatedAt': args.date, 'projects': {}}
    for proj in ('towers', 'imperial', 'azur-prime'):
        spec = getattr(args, proj.replace('-', '_'))
        if not spec:
            continue
        path, source = spec.split(':', 1)
        d = json.load(open(path, encoding='utf-8'))
        rule = RULES.get(proj, lambda a: a)
        apts = []
        for a in d['apartments']:
            a = rule(a)
            apts.append({'block': block_no(a['section']), 'floor': a['floor'], 'apt': a['apt'],
                         'area': a['area'], 'status': a['status'], **({'pos': a['pos']} if 'pos' in a else {})})
        apts = add_closed_floors(proj, apply_block_status(proj, apply_overrides(proj, apts)))
        out['projects'][proj] = {'source': source, 'skipped': d.get('skipped', []), 'apartments': apts}
    dst = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'availability.json')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('written', os.path.abspath(dst))


if __name__ == '__main__':
    main()
