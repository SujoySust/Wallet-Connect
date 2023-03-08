export const EXCHANGE_CONTRACT_ABI = `[
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
		"inputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "_nonce",
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
						"internalType": "address",
						"name": "_royaltyPayTo",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_sellerAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_feeAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_royaltyAmount",
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
				"internalType": "uint256",
				"name": "exchangeId",
				"type": "uint256"
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
				"internalType": "uint256",
				"name": "exchangeId",
				"type": "uint256"
			}
		],
		"name": "Exchange",
		"type": "event"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "_nonce",
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
						"internalType": "address",
						"name": "_royaltyPayTo",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_sellerAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_feeAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_royaltyAmount",
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
				"components": [
					{
						"internalType": "string",
						"name": "_nonce",
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
						"internalType": "address",
						"name": "_royaltyPayTo",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_sellerAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_feeAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_royaltyAmount",
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
				"internalType": "uint256",
				"name": "exchangeId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "minBidAmountToExecute",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "_sellerSig",
				"type": "bytes"
			},
			{
				"internalType": "bytes",
				"name": "_buyerSig",
				"type": "bytes"
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
		"anonymous": false,
		"inputs": [],
		"name": "Paused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "_nonce",
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
						"internalType": "address",
						"name": "_royaltyPayTo",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_sellerAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_feeAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_royaltyAmount",
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
				"internalType": "uint256",
				"name": "exchangeId",
				"type": "uint256"
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
		"anonymous": false,
		"inputs": [],
		"name": "Unpaused",
		"type": "event"
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
		"name": "name",
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
		"inputs": [],
		"name": "version",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]`;
