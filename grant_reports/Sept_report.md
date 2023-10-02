# MVP development report :mailbox:

* **Application link:** https://forum.sia.tech/t/grant-proposal-arc-data-wallet/353
* **Development time:** 2 months

**Deliverables**

| Number | Deliverable | Link | Notes |
| ------------- | ------------- | ------------- |------------- |
| 0a. | License | [LICENSE](https://github.com/bsn-si/sia-datawallet-extension/edit/develop/LICENSE) | Apache 2.0 license |
| 0b. | Solution design | Redeveloped [design](https://user-images.githubusercontent.com/98888366/265647380-6124bd98-29b4-482b-9001-bbfccb1687ba.png) | Currently we test the solution with a local node in the TestNet. Node deployment for public access and testing is planned for the next month. |
| 1. | ARC data wallet extension | [Browser extension rep]( https://github.com/bsn-si/sia-datawallet-extension) | We have made some minor improvements (like uploading progress tracking) and added a background uploading feature - the upload is not interruptted wjhile the extension is hidden. | 
| 2. | ARC storage gateway | [Billing feature](https://github.com/bsn-si/sia-datawallet-gateway/tree/develop/src/services-lago) | We have added payments and billing feature. For subscription based billing we use [lago](https://github.com/getlago/lago). Users are billed by their sending wallet addresses. | 

**Additional Information**  
Here's the current solution architecture:
![siaDataWallet final](https://github.com/bsn-si/sia-datawallet-extension/assets/98888366/e550e84c-85c1-40cd-9d58-f9ccf2730ec7)  
