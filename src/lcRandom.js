var Engine = Engine || { }; // Shared app object

Engine.lcRandom =
    (function () {
        //-------------------------------------------------------------------------

        var seed,
            m = 0x1000000000000, //2^48
            sqrtM = 0x1000000,
            a = 31167285,
            c = 1,
            x;

        //=========================================================================

        function reseed(newSeed) {
            if (newSeed === undefined) {
                newSeed = Date.now();
            }
            x = seed = newSeed;
        }

        //-------------------------------------------------------------------------

        function getSeed() {
            return seed;
        }

        //=========================================================================

        function real() {
            return integer(m) / m;
        }

        //-------------------------------------------------------------------------

        function integer(limit) {
            if (seed === undefined) {
                reseed();
            }
            x = ( a * x + c ) % m;
            if (limit < sqrtM)            //When possible, just use the
                return (x / sqrtM) % limit; // higher-order bits.
            else
                return x % limit;
        }

        //=========================================================================

        return {
            reseed:reseed,
            getSeed:getSeed,
            real:real,
            integer:integer
        };

        //-------------------------------------------------------------------------
    })();
