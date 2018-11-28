# AuthConnect

PKI- and token-based service for authentication/authorization of users/apps for a multi-tenant system.

## Working with keys and JWT

### Install
```
npm install -g node-jose-tools
``` 

### Create a new key
```
jose newkey --RSA > my.key
```

### Add a key into a new keystore
```
jose addkey -C -b my.key > my.ks
```

### Show a public key
```
jose findkey -p -j my.ks
```

### Show a private key
```
jose findkey -j my.ks
```

### Create and sign a new JWT
```
jose listkeys -j my.ks
jose sign -j my.ks -l RS256 -k <value-from-the-line-above> -i myissuer -a myaudience -p my.dat > my.jwt
```

### Verify a JWT
```
cat my.jwt | jose verify -j my.ks -i myissuer -a myaudience
``` 