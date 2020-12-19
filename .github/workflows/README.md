# Local Runner

- The `actions/checkout@v2` action requires git 1.18+

```
sudo add-apt-repository ppa:git-core/ppa
sudo apt-get update
sudo apt-get install git
```

# Integration Tests

```bash
# Local development
TAG=`git rev-parse --short HEAD` python -m unittest modules/core/tests/integration_test.py

# CI
docker-compose pull
TAG=edge python -m unittest modules/core/tests/integration_test.py

```
