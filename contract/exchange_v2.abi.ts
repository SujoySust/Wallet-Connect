export const EXCHANGE_CONTRACT_ABI = `[
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_contractName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_contractVersion",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_admin",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "exchangeId",
				"type": "string"
			}
		],
		"name": "Exchange",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_account",
				"type": "address"
			}
		],
		"name": "addAdmin",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "adminCount",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "admins",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "_sellId",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "_startsAt",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_expiresAt",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "_nftContract",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_nftTokenId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "_paymentTokenContract",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "_seller",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_sellerAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_feeWithRoyalty",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_totalAmount",
						"type": "uint256"
					}
				],
				"internalType": "struct NFTexchange.SellOrder",
				"name": "sell",
				"type": "tuple"
			},
			{
				"internalType": "string",
				"name": "exchangeId",
				"type": "string"
			},
			{
				"internalType": "bytes",
				"name": "_signature",
				"type": "bytes"
			}
		],
		"name": "buyNFT",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "chainId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractName",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractVersion",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_account",
				"type": "address"
			}
		],
		"name": "deleteAdmin",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "exchangeId",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_nftTokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_paymentTokenContract",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_seller",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_buyer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_sellerAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_feeWithRoyalty",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_totalAmount",
				"type": "uint256"
			}
		],
		"name": "exchangeNFTauction",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllAdmins",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pauseContract",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "_buyId",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "_startsAt",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_expiresAt",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "_nftContract",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_nftTokenId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "_paymentTokenContract",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "_buyer",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_sellerAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_feeWithRoyalty",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_totalAmount",
						"type": "uint256"
					}
				],
				"internalType": "struct NFTexchange.BuyOrder",
				"name": "buy",
				"type": "tuple"
			},
			{
				"internalType": "string",
				"name": "exchangeId",
				"type": "string"
			},
			{
				"internalType": "bytes",
				"name": "_signature",
				"type": "bytes"
			}
		],
		"name": "sellNFT",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unPauseContract",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_tokenContract",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawERC20Token",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amountInWei",
				"type": "uint256"
			}
		],
		"name": "withdrawETH",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]`;
