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

1. An owner pico representing a Google account, and named by a 21 digit Google ID (179)
1. An owner pico representing a GitHub account, and named by an 6-8 digit GitHub user id (10)
1. An _ad hoc_ pico created by one of us in the same pico-engine (10)
1. An agent pico created through the Agents'R'us agency on the same pico-engine, and named by an account name (which looks like an email address) (7)

#### what to use as the name of a Manifold owner pico established through DIDAuth?

For Google and GitHub this was fairly obvious, and their IDs didn't overlap (at least so far!).

#### what agent to use on the Manifold side?

#### how to let the UI know that a connection has been made?

#### what QR Code to display for registering vs. login?

For registering, it would be the invitation to connect.
