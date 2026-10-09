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


# Статусы целого блока по свежей шахматке, которую прислал руководитель продаж
# (Bitrix-файл отстаёт). Белые клетки = свободны, цветные = проданы, 1 этаж не продаётся.
# При следующем «обнови шахматки» сверить с файлом и удалить, если файл уже актуален.
BLOCK_STATUS = {
    'towers': {
        '2': {'free': {119, 122, 123, 129, 152, 156, 159}},  # шахматка корпуса 2 от 09.10.2026: свободны только белые
        '3': {'free': {18, 153, 154, 155, 157, 158, 159}},  # корпус 3 от 09.10.2026
        '5': {  # шахматка корпуса 5 от 09.10.2026: свободны только белые
            'free': {8, 12, 14, 18, 21, 26, 28, 29, 33, 35, 36, 40, 42, 56, 64, 77, 80, 85, 87, 99, 101},
        },
    },
    'imperial': {
        '2': {  # шахматка блока 2 от 09.10.2026: свободны белые + 13–14 этажи (бронь кв. 135 — из FLOOR_OVERRIDES)
            'free': {43, 69, 79, 83, 93, 106, 115,
                     121, 122, 123, 124, 125, 126, 127, 131, 132, 133, 134, 136, 137},
        },
        '4': {  # шахматка блока 4 от 09.10.2026: 11 квартир на этаже по стоякам, 11–12 этажи закрыты
            'free': {'1', '4/2', '46', '60', '24/2', '25', '28/2', '75', '32/2', '80'},
            'columns': [75.59, 48.54, 93.36, 45.3, 26.95, 26.68, 76.1, 53.45, 52.6, 32.23, 25.55],
            'closed_floors': {11, 12},
        },
        '5': {  # шахматка блока 5 от 09.10.2026; кв. 150 (жёлтая) снята с продажи
            'free': {12, 13, 26, 65, 73, 92, 102, 104, 105, 115, 119, 125, 126, 131, 140,
                     141, 142, 143, 144, 145, 146, 147, 148, 149, 151, 152, 153, 154},
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
            key = a['apt'] if isinstance(next(iter(r['free'])), str) else int(re.sub(r'\D', '', a['apt']) or 0)
            if a['floor'] in r.get('closed_floors', ()):
                a = {**a, 'status': 'not_for_sale', 'hide': True}
            elif a['status'] != 'reserved' or key in r['free']:  # бронь сохраняем, если квартиру не открыли явно
                a = {**a, 'status': 'not_for_sale' if a['floor'] == 1 else ('free' if key in r['free'] else 'sold')}
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
                if i not in have:
                    out.append({'block': block, 'floor': fl, 'apt': '', 'area': area, 'status': 'sold', 'ord': i, 'hide': True})
    return out


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
        apts = add_closed_floors(proj, apply_block_status(proj, apply_overrides(proj, apts)))
        out['projects'][proj] = {'source': source, 'skipped': d.get('skipped', []), 'apartments': apts}
    dst = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'availability.json')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('written', os.path.abspath(dst))


if __name__ == '__main__':
    main()
