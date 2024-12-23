# Exodus Full-Stack Code Challenge

## Project

The purpose of this project is to create a small custodial wallet app that demos an end-to-end purchase of bitcoin with fiat.

Work on this challenge as you would work as a member of a development team. Consider the other devs that will review your code as your teammates in this project.

Please **do not** work more than 8 hours on this without checking in with us to see if you're on the right path. We don't want to waste your time.

### Signup Flow

- The user can sign up for an account with an email and password (no need to verify their email)
- During sign-up, the user must also provide some basic personal information (e.g., their name)
- The user should be able to authenticate using the provided email address
- The user must then link their bank account via [Plaid](https://plaid.com) (in sandbox mode)
- The backend generates a bitcoin address for the user (each user has a single address)

### Purchase Flow

- An authenticated user that has linked their bank account should be allowed to purchase bitcoin (you will need to [set up a regtest bitcoin node](https://developer.bitcoin.org/examples/testing.html#regtest-mode) locally)
- The user should receive regtest bitcoin via a bitcoin transaction and see their balance update
- Do NOT worry about charging the user’s fake bank account, just connecting it is enough for the purpose of this exercise

### Bonus Track

_Note: [code quality](#code-guidelines) in the required features is more important than completing the bonus track!_

- Passwordless authentication using [passkeys](https://passkeys.dev) instead of email and password
- The user should NOT be able to purchase more bitcoin than what they can purchase with their current bank account balance (essentially, do a balance check before allowing them to purchase)
- The user can see their bank accounts with their corresponding balance, and chose which one to debit for the bitcoin purchase
- The user is automatically logged in after creating their account

## Rules

- Create either a web app with React or a mobile app with React Native
- Use [Plaid](https://plaid.com) to allow the user to connect their bank account
- Use Node.js for any backend development
- You can use ANY open source npm library

## Deployment

You will get bonus points if you deploy your working project to an infrastructure provider of your choice. We recommend either [Heroku](https://www.heroku.com), [Netlify](https://www.netlify.com), or [Vercel](https://vercel.com). If you need to, you can mirror this repo in a **private** repo in your GitHub account, so that you can connect and authorize these services there.

If you don't have time to deploy, please record a quick 1-5 minute demo on `localhost` of the flows you were able to implement.

## Resources

- If you're not familiar with regtest, here’s a good [intro](https://bitcoin.stackexchange.com/questions/70156/difference-between-regtest-and-testnet)
- If you've never set up your own bitcoin regtest node, here’s a good [tutorial](https://gist.github.com/olistic/2d5e303da5eb9ff4fa5f794b39171842) for setting it up

## Code Guidelines

Please refer to this [document](https://github.com/ExodusMovementInterviews/exodus-hiring-code-guidelines) for things we'd like to see (and will be looking for) in your code.

__Please add project setup instructions in README.md.__

## FAQs

### Can I code the solution in Typescript?
No, please use only JavaScript. Although we use TypeScript for some projects internally, code challenges in JavaScript give us more flexibility when it comes to reviewing your code.
    
### Can I start right away? 
Whatever works best for you. However, we don’t expect you to start until you have received your BTC payment.
    
### I have already spent 8 hours working on the code challenge, and it’s still a work in progress. What should I do?
1. Commit and push your work as it will help us know if you are on the right path  
2. Reach out to our recruitment team (or the one who sent you the code challenge) and let them know about it  
3. Our recruiter will get back to you at the earliest - letting you know whether adding more efforts to the code challenge is worth your time
    
### Can I add unit tests to my solution?
Yes, bonus points for these.
    
### I am stuck. What should I do?
Please reach out to our recruiter, and we will try our best to help you.

If you still have questions, don't hesitate to ask your recruiter!

### If I'm using pull requests, should I merge them to master?

Please do.
