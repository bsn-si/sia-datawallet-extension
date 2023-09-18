<h1 align="center">
     ✨ ARC Data Wallet 👛
</h1>
 
ARC Data Wallet is an easy way to use the SIA network for on-chain file storage with a ligt "wallet-like" browser extension. This solution enables private users to use the SIA storage network independently on any device without the need to download and sync the local SIA node. This project is developed under the SIA Foundation grant.

![siaDataWallet final](https://github.com/bsn-si/sia-datawallet-gateway/assets/98888366/6124bd98-29b4-482b-9001-bbfccb1687ba)

This repository contains the ARC Data Wallet browser extension, it splits user's files into chunks, encrypts them with the user’s key and send them to the ARC Gateway for organizing storage in the SIA network.

## Disclaimer
Thу work is in progress. You can see progress reports [here](https://github.com/bsn-si/sia-datawallet-extension/tree/develop/grant_reports).

## Dependencies

- https://github.com/siacentral/sia-lite-wallet-web

Change in sia-lite-wallet-web-master:

Main net: https://api.siacentral.com/v2

Test net: https://api.siacentral.com/v2/zen

and rebuild:

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

Copy sia-lite-wallet-web-master/src/sia/* to src/sia/.

Api generated from https://api.sia.tech/renterd using Postman to get the swagger.json file and then using swagger-typescript-api to generate the api.ts file.

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

```bash
curl -u ":test" -X PUT localhost:9880/api/bus/setting/redundancy --data '{
    "minShards": 1,
    "totalShards": 3
}'
```

```bash
curl -u ":test" -X PUT localhost:9880/api/autopilot/config --data '{
    "wallet": {
        "defragThreshold": 1000
    },
    "hosts": {
        "ignoreRedundantIPs": true,
        "maxDowntimeHours": 168,
        "scoreOverrides": {}
    },
    "contracts": {
        "set": "autopilot",
        "amount": 10,
        "allowance": "1000000000000000000000000000",
        "period": 6048,
        "renewWindow": 2016,
        "download": 10000000000,
        "upload": 10000000000,
        "storage": 10000000000
    }
}'
```

- https://github.com/antfu/vitesse-webext
- https://github.com/n1crack/vuefinder
- https://github.com/getlago/lago
- https://github.com/sh-dv/hat.sh/

## .env file
    
```bash
BASE_URL=/
VITE_API_HOST=https://localhost:443
VITE_SIG_V2_SYMMETRIC=
VITE_SIG_V2_ASYMMETRIC=
```

##Related repos
[The ARC Gateway](https://github.com/bsn-si/sia-datawallet-extension)
