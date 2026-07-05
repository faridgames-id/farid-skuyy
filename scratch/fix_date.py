import os
import re

src_dir = 'c:/Apps Custom/Tracker Farid Skuyy/farid-tracker/src'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Simple search for occurrences of .toISOString().slice(0, 10) on new Date() or d
    # Case 1: `new Date().toISOString().slice(0, 10)` -> `getLocalISOString()`
    # Case 2: `d.toISOString().slice(0, 10)` -> `getLocalISOString(d)`
    # Case 3: `startDate.toISOString().slice(0, 10)` -> `getLocalISOString(startDate)`
    # Case 4: `viewDate.toISOString().slice(0, 7)` -> `getLocalISOMonth(viewDate)`
    
    # We will just inject the import if there are any matches and do replacements
    
    import_statement = "import { getLocalISOString, getLocalISOMonth } from '"
    
    # determine relative path to src/utils/date
    rel_path = os.path.relpath(os.path.join(src_dir, 'utils/date'), os.path.dirname(filepath)).replace('\\', '/')
    if not rel_path.startswith('.'):
        rel_path = './' + rel_path
    import_statement += rel_path + "'\n"

    # Replacements
    content = re.sub(r'new Date\(\)\.toISOString\(\)\.slice\(0,\s*10\)', 'getLocalISOString()', content)
    content = re.sub(r'new Date\([^)]+\)\.toISOString\(\)\.slice\(0,\s*10\)', lambda m: f'getLocalISOString({m.group(0).split(".toISOString")[0]})', content)
    content = re.sub(r'([a-zA-Z0-9_]+)\.toISOString\(\)\.slice\(0,\s*10\)', r'getLocalISOString(\1)', content)
    
    content = re.sub(r'([a-zA-Z0-9_]+)\.toISOString\(\)\.slice\(0,\s*7\)', r'getLocalISOMonth(\1)', content)
    content = re.sub(r'new Date\(\)\.toISOString\(\)\.split\(\'T\'\)\[0\]', 'getLocalISOString()', content)

    # Special case for function toISO(d: Date) { return d.toISOString().slice(0, 10) } -> just replace its body
    content = re.sub(r'function toISO\(d:\s*Date\)\s*\{\s*return d\.toISOString\(\)\.slice\(0,\s*10\)\s*\}', r'function toISO(d: Date) { return getLocalISOString(d) }', content)

    if content != original:
        # Add import statement after the last import
        imports = re.findall(r'^import .+\n', content, re.MULTILINE)
        if imports:
            last_import = imports[-1]
            content = content.replace(last_import, last_import + import_statement, 1)
        else:
            content = import_statement + content
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            if file != 'date.ts':
                process_file(os.path.join(root, file))
