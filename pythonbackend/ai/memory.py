user_memory = {}

def save_memory(user_id, role, text):
    if user_id not in user_memory:
        user_memory[user_id] = []

    user_memory[user_id].append({
        "role": role,
        "text": text
    })

    user_memory[user_id] = user_memory[user_id][-10:]


def get_memory(user_id):
    return user_memory.get(user_id, [])