# DIDAuth-to-Manifold
experiments in using SSI for Manifold

## the problem

Manifold currently allows federation to a pre-established account with either
Google or GitHub.
We would like to be able to use mobile digital wallets
to connect to an agent in Manifold.

### questions

Currently an account in Manifold is reified as an owner pico.
An owner pico is a direct child of the Root Pico.
There are now four kinds of direct child picos (how many as of 2/3/20):

1. An owner pico representing a Google account, and named by a 21 digit Google ID (276)
1. An owner pico representing a GitHub account, and named by an 6-8 digit GitHub user id (34)
1. An _ad hoc_ pico created by one of us in the same pico-engine (10)
1. An agent pico created through the Agents'R'us agency on the same pico-engine, and named by an account name (which looks like an email address) (9)

#### what to use as the name of a Manifold owner pico established through DIDAuth?

For Google and GitHub this was fairly obvious, and their IDs didn't overlap (at least so far!).

We will use a DID as the name of the Manifold owner pico. It will be the DID of the connection between the browser tab agent and the owner's mobile wallet.

![Agent connections](https://picolab.github.io/DIDAuth-to-Manifold/agents.png)

#### what agent to use on the Manifold side?

The web page provided by `manifold.picolabs.io` will include an browser tab agent. This agent will have a connection to the owner's mobile wallet.

#### how to let the UI know that a connection has been made?

We will need to poll for the connection.

#### what QR Code to display for registering vs. login?

For registering, it would be the invitation to connect, from the browser tab agent to the owner's mobile wallet.

## a proof of concept

[work in progress](https://picolab.github.io/DIDAuth-to-Manifold/)
