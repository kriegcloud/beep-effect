if [ $(git rev-parse --abbrev-ref HEAD) = "main" ] && test $(grep shexSpec/shexTest.git .travis.yml | grep branch=main | wc -l) != 1
then echo "ERROR in .travis.yml: shex.js main should be testing on shexTest main\n^^^^^\n" ; exit -1
fi
