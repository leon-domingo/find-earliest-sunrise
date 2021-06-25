# find-earliest-sunrise
Find earliest sunrise and list the day length for this time

In order to run the script, please, clone it firstly:

```sh
git clone git@github.com:leon-domingo/find-earliest-sunrise.git
```

or

```sh
git clone https://github.com/leon-domingo/find-earliest-sunrise.git
```

Your can even download it [here](https://github.com/leon-domingo/find-earliest-sunrise/archive/refs/heads/master.zip)

Once you got the project in your disk, cd into it:

```sh
$ cd find-earliest-sunrise
```

Install the dependencies (1):

```sh
$ npm install
```

(1) **node** version **+10** should work fine. Version **+12** (or even **+14** is recommended).

Copy the base _.env_ file

```sh
$ cp .env-sample .env
```

and tweak it with your own parameters for *NUMBER_OF_POINTS* and *MAX_CONCURRENT_FETCH*. *API_URL* is not customizable unless you write your own implementation of _services/get-data.js_.

```
API_URL=https://api.sunrise-sunset.org/json
NUMBER_OF_POINTS=100
MAX_CONCURRENT_FETCH=5
```

*NUMBER_OF_POINTS* is the number of random points (coordinates) which will be generated and obtained their **sunrise** and **sunset** times for.
*MAX_CONCURRENT_FETCH* is the number of concurrent tasks fetching data from the corresponding API.

Once this is done, you can run the script (being inside of the project folder) using:

```sh
$ ./index.js
```

or

```sh
$ npm start
```
