# Sia Data Wallet

## Dependencies

- https://github.com/siacentral/sia-lite-wallet-web


```bash
nvm use 12.22.1

brew install go@1.16

~/.zshrc:
export GOPATH=$HOME/go
export GOROOT="/opt/homebrew/opt/go@1.16/libexec"
export PATH="$PATH:${GOPATH}/bin:${GOROOT}/bin"

go mod download golang.org/x/net

make build
```
- https://github.com/acacode/swagger-typescript-api

```bash
npx swagger-typescript-api -p ./sia-data-wallet/src/services/openapi.yml -o ./sia-data-wallet/src/services -n api.ts --extract-response-error --extract-request-body --extract-request-params
```
renderd
- https://docs.sia.tech/renting/renterd/renterd-workshop
- https://api.sia.tech/renterd
- https://github.com/SiaFoundation/web/tree/main/apps/renterd

```bash
./renterd --autopilot.scannerInterval=2m --autopilot.heartbeat=1m
```

- https://github.com/antfu/vitesse-webext
- https://github.com/n1crack/vuefinder
- https://github.com/getlago/lago
