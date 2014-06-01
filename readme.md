# ipscan

spam your local subnet to find open ports. it's pretty evil

this is partially an experiment to see how much value i can add to the information returned in a simple port scanner.

here are some notable points:

* color coding of results to help users quickly parse whats going on
* use a vendor lookup on the mac addresses found to provide the user with a little additional information (using an ieee oui lookup)
* use a service name lookup on the open ports found (using an iana.org lookup)

## using

```
npm install -g tangmi/ipscan
```

then

```
ipscan -p3000..3010
```
or whatever makes you happy
