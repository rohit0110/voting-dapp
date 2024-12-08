import { Program, BN } from "@coral-xyz/anchor";
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions"
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Voting } from "anchor/target/types/voting";

const IDL = require("/Users/icarus/Desktop/Code/solana/voting-dapp/anchor/target/idl/voting.json");

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://domf5oio6qrcr.cloudfront.net/medialibrary/1980/peanut-butter-healthy.jpg",
    description: "Vote between Crunchy and Smooth peanut butter",
    title: "Vote for your fav peanut butter",
    label: "Vote",
    links: {
      actions: [
        {
          href: "/api/voting?candidate=Crunchy",
          label: "Vote for Crunchy",
          type: "transaction"
        },
        {
          href: "/api/voting?candidate=Smooth",
          label: "Vote for Smooth",
          type: "transaction"
        }
      ],
    },

  };
  return Response.json(actionMetadata, {headers: ACTIONS_CORS_HEADERS});
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");
  if(candidate!="Crunchy" && candidate!="Smooth") {
    return new Response("Invalid Candidate",{ status: 400, headers: ACTIONS_CORS_HEADERS});
  }
  const connection = new Connection("http://127.0.0.1:8899","confirmed");
  const program: Program<Voting> = new Program(IDL,{connection});
  const body: ActionPostRequest = await request.json();
  let voter;
  try {
    voter = new PublicKey(body.account);

  } catch(err) {
    return new Response("Invalid Public Key", {status: 400, headers: ACTIONS_CORS_HEADERS});
  }

  const instruction = await program.methods
    .vote(candidate,new BN(1))
    .accounts({
      signer: voter
    })
    .instruction();
  const blockHash = await connection.getLatestBlockhash();
  const transaction = new Transaction({
      feePayer: voter,
      blockhash: blockHash.blockhash,
      lastValidBlockHeight: blockHash.lastValidBlockHeight,
    })
    .add(instruction);
  
  const response = await createPostResponse({
    fields: {
      transaction: transaction
    }
  });
  console.log("HERE");
  return Response.json(response, {headers: ACTIONS_CORS_HEADERS});
}
