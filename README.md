# turbo-winner

Turbo Winner!

## Development instructions:

First, clone the repository; fetch and build the engine project. (Requires yarn to be globally installed.)

```bash
git clone https://github.com/blslade-neumont/turbo-winner.git
cd turbo-winner
git submodule update --init --recursive
git submodule foreach "yarn && yarn build"
```

Next, install all missing dependencies:

```
cd game && yarn && cd ..
cd frontend && yarn && cd ..
```

### To start the frontend/game client:

```
cd frontend
yarn start
```
