var GameRecords = (function () {
    function GameRecords() {
    }

    GameRecords.prototype.get = function ( index ) {
        if (index == 1)
            return getExample_1();
        else if (index == 2)
            return getExample_2();
        else if (index == 101)
            return getExample_101();
        return null;
    }

    // ブルール vs フィリドール
    function getExample_2() {
        return [
            "e4", "e5",
            "Bc4", "c6",
            "Qe2", "d6",
            "c3", "f5",
            "d3", "Nf6",
            "exf5", "Bxf5",
            "d4", "e4",
            "Bg5", "d5",
            "Bb3", "Bd6",
            "Nd2", "Nbd7",
            "h3", "h6",
            "Be3", "Qe7",
            "f4", "h5",
            "c4", "a6",
            "cxd5", "cxd5",
            "Qf2", "0-0",
            "Ne2", "b5",
            "0-0", "Nb6",
            "Ng3", "g6",
            "Rac1", "Nc4",
            "Nxf5", "gxf5",
            "Qg3+", "Qg7",
            "Qxg7+", "Kxg7",
            "Bxc4", "bxc4",
            "g3", "Rab8",
            "b3", "Ba3",
            "Rc2", "cxb3",
            "axb3", "Rbc8",
            "Rxc8", "Rxc8",
            "Ra1", "Bb4",
            "Rxa6", "Rc3",
            "Kf2", "Rd3",
            "Ra2", "Bxd2",
            "Rxd2", "Rxb3",
            "Rc2", "h4",
            "Rc7+", "Kg6",
            "gxh4", "Nh5",
            "Rd7", "Nxf4",
            "Bxf4", "Rf3+",
            "Kg2", "Rxf4",
            "Rxd5", "Rf3",
            "Rd8", "Rd3",
            "d5", "f4",
            "d6", "Rd2+",
            "Kf1", "Kf7",
            "h5", "e3",
            "h6", "f3",
            "0-1",
        ];
    }

    // ポレリオ vs ドメニコ
    function getExample_1() {
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
    function getExample_101() {
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
