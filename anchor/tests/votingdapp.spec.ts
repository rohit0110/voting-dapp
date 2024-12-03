import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import { Voting } from 'anchor/target/types/voting';
import { BankrunProvider, startAnchor } from "anchor-bankrun";
const IDL = require("/Users/icarus/Desktop/Code/solana/voting-dapp/anchor/target/idl/voting.json");

const votingAddress = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

describe('voting', () => {

  it('Initialize Poll', async () => {
    const context = await startAnchor("", [{name: "voting",programId: votingAddress}], []);

    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(
      IDL,
      provider,
    );
    
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your fav type of Peanut butter?",
      new anchor.BN(1733219145),
      new anchor.BN(1733220000)
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your fav type of Peanut butter?");
  })

  
})
