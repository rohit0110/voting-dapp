import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import { Voting } from 'anchor/target/types/voting';
import { BankrunProvider, startAnchor } from "anchor-bankrun";
const IDL = require("/Users/icarus/Desktop/Code/solana/voting-dapp/anchor/target/idl/voting.json");

const votingAddress = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

describe('voting', () => {

  let context;
  let provider;
  let votingProgram: Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor("", [{name: "voting",programId: votingAddress}], []);
    provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(
      IDL,
      provider,
    );
  })

  it('Initialize Poll', async () => {
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
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  })

  it('Initialize Candidate', async() => {
    await votingProgram.methods.initializeCandidate(
      "Smooth",
      new anchor.BN(1)
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1)
    ).rpc();

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
      votingAddress
    )

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunchy")],
      votingAddress
    )
    
    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log(smoothCandidate);
    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
    console.log(crunchyCandidate);

    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0);
    expect(smoothCandidate.candidateName).toEqual("Smooth");
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);
    expect(crunchyCandidate.candidateName).toEqual("Crunchy");
  })

  it('vote', async() => {

  })
})
