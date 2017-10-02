var GameRecords = (function () {
    function GameRecords() {
    }

    GameRecords.prototype.get = function ( index ) {
        if (index == 0)
            return getExample0();
        else if (index == 1)
            return getExample1();
        return null;
    }

    function getExample0() {
        return [
            "e4", "e5",
            "Nf3", "Nc6",
            "Bc4", "Nf6",
            "Ng5", "d5",
            "exd5", "Nxd5",
            "Nxf7", "Kxf7",
            "Qf3+", "Ke6",
            "Nc3", "Nce7",
            "d4", "c6",
            "Bg5", "h6",
            "Bxe7", "Bxe7",
            "0-0-0", "Rf8",
            "Qe4", "Rxf2?",
            "dxe5", "Bg5+",
            "Kb1", "Rd2",
            "h4", "Rxd1+",
            "Rxd1", "Bxh4",
            "Nxd5", "cxd5",
            "Rxd5", "Qg5",
            "Rd6+", "Ke7",
            "Rg6", "1-0"
        ];
    }

    // The game of the century
    function getExample1() {
        return [
            "Nf3", "Nf6",
            "c4", "g6",
            "Nc3", "Bg7",
            "d4", "0-0",
            "Bf4", "d5",
            "Qb3", "dxc4",
            "Qxc4", "c6",
            "e4", "Nbd7",
            "Rd1", "Nb6",
            "Qc5", "Bg4",
            "Bg5", "Na4",
            "Qa3", "Nxc3",
            "bxc3", "Nxe4",
            "Bxe7", "Qb6",
            "Bc4", "Nxc3",
            "Bc5", "Rfe8+",
            "Kf1", "Be6",
            "Bxb6", "Bxc4+",
            "Kg1", "Ne2+",
            "Kf1", "Nxd4+",
            "Kg1", "Ne2+",
            "Kf1", "Nc3+",
            "Kg1", "axb6",
            "Qb4", "Ra4",
            "Qxb6", "Nxd1",
            "h3", "Rxa2",
            "Kh2", "Nxf2",
            "Re1", "Rxe1",
            "Qd8+", "Bf8",
            "Nxe1", "Bd5",
            "Nf3", "Ne4",
            "Qb8", "b5",
            "h4", "h5",
            "Ne5", "Kg7",
            "Kg1", "Bc5+",
            "Kf1", "Ng3+",
            "Ke1", "Bb4+",
            "Kd1", "Bb3+",
            "Kc1", "Ne2+",
            "Kb1", "Nc3+",
            "Kc1", "Rc2#"
        ];
    }

    return GameRecords;
})();
