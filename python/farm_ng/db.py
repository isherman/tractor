import json
import logging
import os

import file
import path

logger = logging.getLogger('db')
logger.setLevel(logging.INFO)


class FileBackedDatabase:
    """

    This is not thread-safe, nor is it safe for multiple processes to access the same database at once.
    """

    cache = None
    db_path = None

    def __init__(self, db_name):
        root_dir = os.environ.get('FARM_NG_ROOT')
        if not root_dir:
            raise Exception('Environment variable FARM_NG_ROOT not set')
        self.db_path = path.join(root_dir, 'db', f'{db_name}.json')
        logger.info('Opening db backed by ', self.db_path)
        self._refreshCache()

    def _refreshCache(self):
        with file.open(self.db_path) as f:
            self.cache = json.load(f)

    def get(self, key):
        if not self.cache:
            self._refreshCache()
        return self.cache.get(key)

    def set(self, key, value):
        self.cache[key] = value
        with open(self.db_path) as f:
            json.dump(self.cache, f)
