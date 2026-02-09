class BufferMemory:
    def __init__(self, max_messages: int):
        self.max_messages = max_messages
        self.messages = []

    def add(self, message):
        self.messages.append(message)
        self.messages = self.messages[-self.max_messages :]

    def get(self):
        return self.messages

    def clear(self):
        self.messages = []
