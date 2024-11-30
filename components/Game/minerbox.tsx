import { MiniKit } from "@worldcoin/minikit-js";

export const Minerbox = () => {
  const ABI = [
    {
      inputs: [
        {
          components: [
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ISignatureTransfer.TokenPermissions",
              name: "permitted",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
          ],
          internalType: "struct ISignatureTransfer.PermitTransferFrom",
          name: "permit",
          type: "tuple",
        },
        {
          components: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "requestedAmount",
              type: "uint256",
            },
          ],
          internalType: "struct ISignatureTransfer.SignatureTransferDetails",
          name: "transferDetails",
          type: "tuple",
        },
        {
          internalType: "bytes",
          name: "signature",
          type: "bytes",
        },
      ],
      name: "depositERC20",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();

  const permitTransfer = {
    permitted: {
      token: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      amount: "1",
    },
    nonce: Date.now().toString(),
    deadline,
  };

  const permitTransferArgsForm = [
    [permitTransfer.permitted.token, permitTransfer.permitted.amount],
    permitTransfer.nonce,
    permitTransfer.deadline,
  ];

  const transferDetails = {
    to: "0xE4e9e6C6cFdBA65cf0d02F5eDF52F1688Ea0ec39",
    requestedAmount: "1",
  };

  const transferDetailsArgsForm = [
    transferDetails.to,
    transferDetails.requestedAmount,
  ];

  const handleBuyWorker = async () => {
    try {
      const response = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: "0x11823726Cc88F98E2E92911D0206AF8d0c6b3565", // Contract address
            abi: ABI, // ABI of the function
            functionName: "depositERC20", // Name of the function
            args: [
              permitTransferArgsForm,
              transferDetailsArgsForm,
              "PERMIT2_SIGNATURE_PLACEHOLDER_0",
            ],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: "0x11823726Cc88F98E2E92911D0206AF8d0c6b3565",
          },
        ],
      });
      console.log("Transaction sent:", response);
    } catch (error) {
      console.error("Error executing transaction:", error);
    }
  };

  return (
    <div className="flex flex-col justify-between border-2 border-red-400 mb-2 m-2 rounded-md p-5">
      <button
        onClick={handleBuyWorker}
        className="border-2 border-green-500 rounded-md text-green-600 text-sm px-4 py-2"
      >
        Deposit
      </button>
    </div>
  );
};
