# Backend
FinTech backed written in NodeJS, MongoDB, Express. Stores the clients Redux stores in Mongo and handles login, signup, payments. Routing on frontend

# Pre Install :
1. Signup or login to Stripe (stripe.com) and verify your email address
2. Get your test API keys ( or live keys by activating your account)
3. Note the keys, pk_ for STRIPE_PUBLISHABLE_KEY and sk_ for STRIPE_SECRET_KEY for config.env
4. Click products on the left side and add two products
5. In each products page (by clicking on them) copy the API ID which looks like price_ and note for BASIC and PREMIUM where basic is a 7 day trial and cheaper subscription and PREMIUM is for advisor clients 
6. Your STRIPE_WEBHOOK_SECRET (whsec_) can be obtained by either for test (in CLI) running ‘stripe listen’ or in the developer section of the Stripe dashboard, clicking Webhooks and creating a webhook endpoint ({your_host}/api/purchases/webhook)
7. Note your Mongo Connection string from your provider and the username and password. DATABASE is the connect string with username:<PASSWORD>
8. DATABASE_PASSWORD is your password for that database user
9. EMAIL_ variables are for development mailtrap credentials
10. SENDGRID_ is the variables where you input your production sendgrid values given by sendgrid when you create your access

# README
1. Install a NodeJS version  >10, testing at 12.16.3 as of writing
2. Test with “node -v” should show version if correctly installed
3. Git clone or download as zip (https://github.com/COMP4910-SavvyPlanBackend/Backend.git)
4. Run “npm install -g nodemon”
5. cd / move to directory
6. Run “npm install”
7. Copy and rename config.env.example to config.env
8. Open config.env and put your values (from Stripe,SendGrid,Mongo) there (example will be provided in Appendix C)
9. Run “npm start”
10. Api will be available at localhost:5000/api/{users,purchases,stores}/{route}
11. Set NODE_ENV to production for live emails to the users email. Note: variable may not be loaded in this mode as Heroku loads them in production and dotenv in Dev
* Demo Backend Version: https://savvyplantest.herokuapp.com/api/
