<p align="right">
<a href="https://autorelease.general.dmz.palantir.tech/palantir/hadoop-crypto"><img src="https://img.shields.io/badge/Perform%20an-Autorelease-success.svg" alt="Autorelease"></a>
</p>

[![CircleCI Build Status](https://circleci.com/gh/palantir/hadoop-crypto/tree/develop.svg?style=shield)](https://circleci.com/gh/palantir/hadoop-crypto)
![Maven Central](https://img.shields.io/maven-central/v/com.palantir.hadoop-crypto2/hadoop-crypto)

Seekable Crypto
===============
*Seekable Crypto* is a Java library that provides the ability to seek within
`SeekableInput`s while decrypting the underlying contents along with some
utilities for storing and generating the keys used to encrypt/decrypt the data
streams. An implementation of the Hadoop FileSystem is also included that uses
the Seekable Crypto library to provide efficient and transparent client-side
encryption for Hadoop filesystems.

Supported Ciphers
-----------------
Currently `AES/CTR/NoPadding` and `AES/CBC/PKCS5Padding` are supported.

**Disclaimer** Neither supported AES mode is [authenticated](https://en.wikipedia.org/wiki/Authenticated_encryption).
Authentication should be performed by consumers of this library via an
external cryptographic mechanism such as Encrypt-then-MAC. Failure to
properly authenticate ciphertext breaks security in some scenarios where an
attacker can manipulate ciphertext inputs.

Programatic Example
-------------------

Source for examples can be found [here](crypto-core/src/test/java/com/palantir/crypto2/example/ExampleUsage.java)

```java
byte[] bytes = "0123456789".getBytes(StandardCharsets.UTF_8);

// Store this key material for future decryption
KeyMaterial keyMaterial = SeekableCipherFactory.generateKeyMaterial(AesCtrCipher.ALGORITHM);
ByteArrayOutputStream os = new ByteArrayOutputStream(bytes.length);

// Encrypt some bytes
OutputStream encryptedStream = CryptoStreamFactory.encrypt(os, keyMaterial, AesCtrCipher.ALGORITHM);
encryptedStream.write(bytes);
encryptedStream.close();
byte[] encryptedBytes = os.toByteArray();

// Bytes written to stream are encrypted
assertThat(encryptedBytes).isNotEqualTo(bytes);

SeekableInput is = new InMemorySeekableDataInput(encryptedBytes);
SeekableInput decryptedStream = CryptoStreamFactory.decrypt(is, keyMaterial, AesCtrCipher.ALGORITHM);

// Seek to the last byte in the decrypted stream and verify its decrypted value
byte[] readBytes = new byte[bytes.length];
decryptedStream.seek(bytes.length - 1);
decryptedStream.read(readBytes, 0, 1);
assertThat(readBytes[0]).isEqualTo(bytes[bytes.length - 1]);

// Seek to the beginning of the decrypted stream and verify it's equal to the raw bytes
decryptedStream.seek(0);
decryptedStream.read(readBytes, 0, bytes.length);
assertThat(readBytes).isEqualTo(bytes);
```

Hadoop Crypto
=============
*Hadoop Crypto* is a library for per-file client-side encryption in Hadoop
FileSystems such as HDFS or S3. It provides wrappers for the Hadoop FileSystem
API that transparently encrypt and decrypt the underlying streams. The
encryption algorithm uses [Key
Encapsulation](https://en.wikipedia.org/wiki/Key_encapsulation): each file is
encrypted with a unique symmetric key, which is itself secured with a
public/private key pair and stored alongside the file.

Architecture
------------
The `EncryptedFileSystem` wraps any `FileSystem` implementation and encrypts the
streams returned by open and close. These streams are encrypted/decrypted by a
unique per-file symmetric key which is then passed to the `KeyStorageStrategy`
which stores the key for future access. The provided storage strategy
implementation encrypts the symmetric key using a public/private key pair and
then stores the encrypted key on the `FileSystem` with the encrypted file.

Standalone Example
------------------

The hadoop-crypto-all.jar can be added to the classpath of any client and used
to wrap any concrete backing FileSystem. The scheme of the EncryptedFileSystem
is `e[FS-scheme]` where `[FS-scheme]` is any FileSystem that can be instantiated
statically using `FileSystem#get` (eg: efile). The FileSystem implementation,
public key, and private key must be configured in the core-site.xml as well.

### Hadoop Cli

Add hadoop-crypto-all.jar to the classpath of the cli (ex: share/hadoop/common).

##### Generate public/private keys
``` bash
openssl genrsa -out rsa.key 2048
# Public Key
openssl rsa -in rsa.key -outform PEM -pubout 2>/dev/null | grep -v PUBLIC | tr -d '\r\n'
# Private Key
openssl pkcs8 -topk8 -inform pem -in rsa.key -outform pem -nocrypt | grep -v PRIVATE | tr -d '\r\n'
```

##### core-site.xml
```xml
<configuration>
    <property>
        <name>fs.efile.impl</name> <!-- others: fs.es3a.impl or fs.ehdfs.impl -->
        <value>com.palantir.crypto2.hadoop.StandaloneEncryptedFileSystem</value>
    </property>

    <property>
        <name>fs.efs.key.public</name>
        <value>MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqXkSOcB2UpLrlG3scAHDavPnSucxOwRWG12woY5JerYlqyIm7xcNuyLQ/rLPxdlCGgOZOoPzKVXc/3pAeOdPM1LcXLNW8d7Uht3vo7a6SR/mXMiCTMn+9wOx40Bq0ofvx9K4RSpW2lKrlJNUJG+RP5lO7OhB5pveEBMn/8OR2yMLgS58rHQ0nrXXUHqbWiMI8k+eYK7aimexkQDhIXtbqmQ5tAXKyoSMDAyeuDNY8WsYaW15OCwGSIRClNAiwPEGLQCYJQi41IxwQxwN42jQm7fwoVSrN4lAfi5B8EHxFglAZcE8nUTdTnXCbUk9SPz8XXmK4hmK9X4L+2Av4ucNLwIDAQAB</value>
    </property>

    <property>
        <name>fs.efs.key.private</name>
        <value>MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCpeRI5wHZSkuuUbexwAcNq8+dK5zE7BFYbXbChjkl6tiWrIibvFw27ItD+ss/F2UIaA5k6g/MpVdz/ekB4508zUtxcs1bx3tSG3e+jtrpJH+ZcyIJMyf73A7HjQGrSh+/H0rhFKlbaUquUk1Qkb5E/mU7s6EHmm94QEyf/w5HbIwuBLnysdDSetddQeptaIwjyT55grtqKZ7GRAOEhe1uqZDm0BcrKhIwMDJ64M1jxaxhpbXk4LAZIhEKU0CLA8QYtAJglCLjUjHBDHA3jaNCbt/ChVKs3iUB+LkHwQfEWCUBlwTydRN1OdcJtST1I/PxdeYriGYr1fgv7YC/i5w0vAgMBAAECggEASvSLhROEwbzNiRadLmT5Q4Kg19YtRgcC9pOXnbzK7wVE3835HmI55nzdpuj7UGxo+gyBZwoZMD0Tw8MUZOUZeH+7ixye5ddCdGwQo34cIl+DiaH9T20/4Yy2zuYc2QTanqyqZ5z0URejX9FRs9PMkC6EY+/NxetGaiGu3UZoalz7F/5wS8bCaKPkm3AjLvqXHL5KiSbPDPBQj4m+iFWLoWZL9FB1zyif+yBatU4cBCLHaTTgXroItEKcxTwFfyi2l059ItoP5E10djKHpMuPiPrTMS0FHAom3GZAYEFnjRgInR0sIotEwuSDObqcio1PdXRsi5Ul8MxfpXxLSuL+UQKBgQDcvmehBARNDksQJGzIyegKg10eLYdfXFCR+QDZeqJod/pCQ6gtW0aFYAoL0uXiMwQzSb6m7offmXH0JLLqOnjgcZlejHUDSTTWtNOYlGaO7OVgFcnG6/UnCE54eJcaw68auvPB9XW3gm5cfWSNpUI+6aJDBb6BKx8uNMoRreq9wwKBgQDEilhsCgUOIRkJfM5MYUzMT0gR8qt671q+lgTjBDwYvdoQ7BijG6Lbqbp9Xd4nODiw1t7e1Rexw+cuIeRs8NITU4f4Nfe25rRhZ+0n7g9OoCiRUoEsmd7cqDk6pubpw9hW1TKKLzTqExisGFy+bnUA8FFs2TbU9Xeb9kdm1GXgJQKBgAsN9f6YRubc+mFakaAUjGxKW9VxDkB2TQqiX6qEe7GjoILFBJ0Q3x06zAX/j8eeKm2vGb8eXuuRsaU6WUNlnjwPNFEJ06pQdjbyY05W0DQEJRCExtARbPuBbPyXfWm3twMtrZtfAYApJgG3vdtiFUk1Rgz5MqshT7RurFfqT8ElAoGAE2BEOVp/hxYSPtI0EGmjRZ0nUMWozDTesF1f2/Wl6xaEchikkSf/VUKVZRik9x7ez+hPDo7ZiCf1GaIzv926CDe69uhzJG/4JoY1ZjNdBPZbKYCFxZzh0MUw5yxfJXquUFkyY1cmE1GQpB6+vfNry4zlqiJ7+mC8yv5rqaKU7JUCgYBXPYpuQppR1EFj66LSrZ8ebXmt5TtwR839UkgEhLOBkO0cFP2BXVAMx9p0/MYLNIPk7vVpVtRCKYr6tBVdUWCin0obC5O+JzuhilQ0aH3xl5mbiasOvCNPjniaTViRt6zNlaq6RMS4x1LqYUyqc4LUrBbGMWJsdjYqVAi1Rq1FTw==</value>
    </property>
</configuration>
```

##### Commands
``` bash
./bin/hadoop dfs -put file.txt efile:/tmp/file.txt
./bin/hadoop dfs -ls efile:/tmp
./bin/hadoop dfs -cat efile:/tmp/file.txt
```

Programatic Example
-------------------

Source for examples can be found [here](hadoop-crypto/src/test/java/com/palantir/hadoop/example/ExampleUsage.java)

### Initialization

```java
// Get a local FileSystem
FileSystem fs = FileSystem.get(new URI("file:///"), new Configuration());

// Initialize EFS with random public/private key pair
KeyPair pair = TestKeyPairs.generateKeyPair();
KeyStorageStrategy keyStore = new FileKeyStorageStrategy(fs, pair);
EncryptedFileSystem efs = new EncryptedFileSystem(fs, keyStore);
```

### Writing data using EFS

``` java
// Init data and local path to write to
byte[] data = "test".getBytes(StandardCharsets.UTF_8);
byte[] readData = new byte[data.length];
Path path = new Path(folder.newFile().getAbsolutePath());

// Write data out to the encrypted stream
OutputStream eos = efs.create(path);
eos.write(data);
eos.close();

// Reading through the decrypted stream produces the original bytes
InputStream ein = efs.open(path);
IOUtils.readFully(ein, readData);
assertThat(data, is(readData));

// Reading through the raw stream produces the encrypted bytes
InputStream in = fs.open(path);
IOUtils.readFully(in, readData);
assertThat(data, is(not(readData)));

// Wrapped symmetric key is stored next to the encrypted file
assertTrue(fs.exists(new Path(path + FileKeyStorageStrategy.EXTENSION)));
```

Hadoop Configuration Properties
-------------------------------


| Key                   | Value                                           | Default
|-----------------------|-------------------------------------------------|--------
|`fs.efs.cipher`        | The cipher used to wrap the underlying streams. | `AES/CTR/NoPadding`
|`fs.e[FS-scheme].impl` | Must be set to `com.palantir.crypto2.hadoop.StandaloneEncryptedFileSystem`
|`fs.efs.key.public`    | Base64 encoded X509 public key
|`fs.efs.key.private`   | Base64 encoded PKCS8 private key
|`fs.efs.key.algorithm` | Public/private key pair algorithm               | `RSA`

License
-------
This repository is made available under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).


FAQ
---

## log.warn lines from `CryptoStreamFactory`

`WARN: Unable to initialize cipher with OpenSSL, falling back to JCE implementation`

'Falling back to the JCE implementation' results in slower cipher performance than native OpenSSL. Resolve this by installing a compatible OpenSSL and symlinking it to the correct location, `/usr/lib/libcrypto.so`. (OpenSSL 1.0 and 1.1 are currently supported)

_Note: to support OpenSSL 1.1, we use releases from the [Palantir fork of commons-crypto](https://github.com/palantir/commons-crypto/releases) as support has been added to the mainline Apache repo, but no release made [since 2016](https://github.com/apache/commons-crypto/releases)._

```
Exception in thread "main" java.io.IOException: java.security.GeneralSecurityException: CryptoCipher {org.apache.commons.crypto.cipher.OpenSslCipher} is not available or transformation AES/CTR/NoPadding is not supported.
	at org.apache.commons.crypto.utils.Utils.getCipherInstance(Utils.java:130)
	at ApacheCommonsCryptoLoad.main(ApacheCommonsCryptoLoad.java:10)
Caused by: java.security.GeneralSecurityException: CryptoCipher {org.apache.commons.crypto.cipher.OpenSslCipher} is not available or transformation AES/CTR/NoPadding is not supported.
	at org.apache.commons.crypto.cipher.CryptoCipherFactory.getCryptoCipher(CryptoCipherFactory.java:176)
	at org.apache.commons.crypto.utils.Utils.getCipherInstance(Utils.java:128)
	... 1 more
Caused by: java.lang.RuntimeException: java.lang.reflect.InvocationTargetException
	at org.apache.commons.crypto.utils.ReflectionUtils.newInstance(ReflectionUtils.java:90)
	at org.apache.commons.crypto.cipher.CryptoCipherFactory.getCryptoCipher(CryptoCipherFactory.java:160)
	... 2 more
Caused by: java.lang.reflect.InvocationTargetException
	at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance(Unknown Source)
	at java.base/jdk.internal.reflect.DelegatingConstructorAccessorImpl.newInstance(Unknown Source)
	at java.base/java.lang.reflect.Constructor.newInstance(Unknown Source)
	at org.apache.commons.crypto.utils.ReflectionUtils.newInstance(ReflectionUtils.java:88)
	... 3 more
Caused by: java.lang.RuntimeException: java.lang.UnsatisfiedLinkError: EVP_CIPHER_CTX_cleanup
	at org.apache.commons.crypto.cipher.OpenSslCipher.<init>(OpenSslCipher.java:59)
	... 8 more
Caused by: java.lang.UnsatisfiedLinkError: EVP_CIPHER_CTX_cleanup
	at org.apache.commons.crypto.cipher.OpenSslNative.initIDs(Native Method)
	at org.apache.commons.crypto.cipher.OpenSsl.<clinit>(OpenSsl.java:95)
	at org.apache.commons.crypto.cipher.OpenSslCipher.<init>(OpenSslCipher.java:57)
	... 8 more
```
