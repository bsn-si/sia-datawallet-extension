# MVP development report :mailbox:

* **Application link:** https://forum.sia.tech/t/grant-proposal-arc-data-wallet/353
* **Development time:** 1 month

**Deliverables**

| Number | Deliverable | Link | Notes |
| ------------- | ------------- | ------------- |------------- |
| 0a. | License | [LICENSE](https://github.com/bsn-si/sia-datawallet-extension/edit/develop/LICENSE) | Apache 2.0 license |
| 0b. | Solution design | Redeveloped [design](https://user-images.githubusercontent.com/98888366/265647380-6124bd98-29b4-482b-9001-bbfccb1687ba.png) | We had to figure out how the SIA Central it works and how to send transactions without installing a SIA desktop solution so that users could pay storage costs from our extension. Test net connection and etc. are also in this scope. Currently we test the solution with a local node in the TestNet. |
| 1. | ARC data wallet extension | [Browser extension rep]( https://github.com/bsn-si/sia-datawallet-extension) | We have started to develop the browser extension UI/UX, you can see the skeleton in the mentioned repository. This extension will split files into chunks, encrypt them with the user’s key and send them to the ARC Gateway for organizing storage in the SIA network. | 
| 2. | ARC storage gateway | [ARC gateway rep](https://github.com/bsn-si/sia-datawallet-gateway) | The ARC gateway receives chunked and encrypted files from a user’s extension, collects into a single file and sends to the remote RenterD node for storage in the SIA network. In this way all files could not be read by this gateway or any other 3rd party as they were encrypted by the user’s browser extension before sending. Later we will develop a payment management backend as a separate solution to manage user’s subscriptions. | 

**Additional Information**  
Here's the current solution architecture:
![siaDataWallet final](https://github.com/bsn-si/sia-datawallet-extension/assets/98888366/e550e84c-85c1-40cd-9d58-f9ccf2730ec7)
