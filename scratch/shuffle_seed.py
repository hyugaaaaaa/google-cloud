import json
import random
import re

def shuffle_seed_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the VALUES part of INSERT statements
    # Pattern to match: ('category_id', 'content', 'options'::jsonb, 'answer', 'explanation')
    pattern = r"\('([^']+)', '([^']+)', '(\[.*?\])'::jsonb, '([^']+)', '([^']+)'\)"
    
    def shuffle_match(match):
        cat_id = match.group(1)
        q_content = match.group(2)
        options_raw = match.group(3)
        answer = match.group(4)
        explanation = match.group(5)
        
        try:
            options = json.loads(options_raw)
            random.shuffle(options)
            # Ensure the answer is still in the options (it should be)
            new_options_raw = json.dumps(options, ensure_ascii=False)
            return f"('{cat_id}', '{q_content}', '{new_options_raw}'::jsonb, '{answer}', '{explanation}')"
        except Exception as e:
            return match.group(0)

    new_content = re.sub(pattern, shuffle_match, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

shuffle_seed_file('/Users/hyuga/Downloads/google-cloud-main/supabase/seed.sql')
