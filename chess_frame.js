// chess_frame.js

/*
    Classes
        > ChessFrame
        > MoveInfo
        > MoveParser
        > PieceState
        > PieceStateSet
        > PositionUtility
        > Renderer
        > SearchOption
        > Size
        > Vector
 */

//=============================================================================================================
// ChessFrame
//=============================================================================================================
var ChessFrame = (function () {
    function ChessFrame() {
        this.contexts = {
            back: document.getElementById( "backCanvas" ).getContext( "2d" ),
            front: document.getElementById( "frontCanvas" ).getContext( "2d" )
        };
        this.pieceStates = new PieceStateSet();
        this.renderer = new Renderer( this.contexts );
        this.moves = [];
        this.countSteps = -1;
        this.isWhiteView = true;
    }

    ChessFrame.prototype.initialize = function ( moves ) {
        document.getElementById( "backCanvas" ).style.display = "none";
        this.pieceStates.initialize();
        this.moves = moves;
        this.updateButtonStates();
        this.renderer.render( this.pieceStates, this.isWhiteView );

        /*
        // デバッグ用
        var count = 30;
        for (var i = 0; i < count; ++i)
            this.goNext();
        */
    }

    ChessFrame.prototype.goPrev = function () {
        if (this.countSteps <= -1)
            return;
        --this.countSteps;
        this.update();
        this.renderer.render( this.pieceStates, this.isWhiteView );
    }

    ChessFrame.prototype.goNext = function () {
        if (this.moves.length <= this.countSteps)
            return;
        ++this.countSteps;
        this.update();
        this.renderer.render( this.pieceStates, this.isWhiteView );
    }

    ChessFrame.prototype.reset = function () {
        this.countSteps = -1;
        this.pieceStates.initialize();
        this.updateButtonStates();
        this.updateMovesDisplay();
        this.renderer.render( this.pieceStates, this.isWhiteView );
    }

    ChessFrame.prototype.switchView = function () {
        this.isWhiteView = !document.getElementById( "blackViewCheck" ).checked;
        this.renderer.render( this.pieceStates, this.isWhiteView );
    }

    ChessFrame.prototype.update = function () {
        this.updateButtonStates();
        this.updateMovesDisplay();

        var partialMoves = [];
        for (var i = 0; i <= this.countSteps; ++i)
            partialMoves.push( this.moves[ i ] );

        this.pieceStates.update( partialMoves );
    }

    ChessFrame.prototype.updateMovesDisplay = function () {
        var movesDisplay = "";
        var countTurns = 1;
        for (var i = 0; i <= this.countSteps; ++i) {
            if (i == 0)
                movesDisplay = countTurns.toString() + ": " + this.moves[ i ];
            else if (i % 2 == 0) {
                ++countTurns;
                movesDisplay += "\r\n" + countTurns.toString() + ": " + this.moves[ i ];
            } else
                movesDisplay += "  " + this.moves[ i ];
        }
        document.getElementById( "movesDisplay" ).value = movesDisplay;
    }

    ChessFrame.prototype.updateButtonStates = function () {
        document.getElementById( "initButton" ).disabled = this.countSteps <= -1;
        document.getElementById( "prevButton" ).disabled = this.countSteps <= -1;
        document.getElementById( "nextButton" ).disabled = this.moves.length - 1 <= this.countSteps;
    }

    return ChessFrame;
})();

//=============================================================================================================
// MoveInfo
//=============================================================================================================
var MoveInfo = (function () {
    function MoveInfo() {
        this.isWhiteMove = false;
        this.isPawnMove = false;
        this.isKnightMove = false;
        this.isBishopMove = false;
        this.isRookMove = false;
        this.isQueenMove = false;
        this.isKingMove = false;
        this.isQueenSideCastling = false;
        this.isKingSideCastling = false;
        this.existsKilledPiece = false;
        this.movedPieceKey = "";
        this.killedPieceKey = "";
        // prev の情報は SearchOption の方に持たせる
        this.postFile = "";
        this.postRank = 0;
        this.isResigned = false;
        this.isDraw = false;
        this.isCheckmate = false;
    }

    return MoveInfo;
})();

//=============================================================================================================
// MoveParser
//=============================================================================================================
var MoveParser = (function () {
    function MoveParser() {
    }

    MoveParser.prototype.Parse = function ( pieceStates, move, isWhiteMove ) {
        var moveInfo = new MoveInfo();
        moveInfo.isWhiteMove = isWhiteMove;

        // "チェック" の除去
        var indexCheck = move.indexOf( "+" );
        if (indexCheck != -1)
            move = move.substring( 0, indexCheck );
        // "疑問手" の除去
        var indexQ = move.indexOf( "?" );
        if (indexQ != -1)
            move = move.substring( 0, indexQ );
        // "チェックメイト" の除去
        var indexCheckMate = move.indexOf( "#" );
        if (indexCheckMate != -1) {
            moveInfo.isCheckmate = true;
            move = move.substring( 0, indexCheckMate );
        }

        if (isFile( move[ 0 ] ))
            ParsePawn( pieceStates, move, isWhiteMove, moveInfo );
        else if (move[ 0 ] == "N")
            ParseKnight( pieceStates, move, isWhiteMove, moveInfo );
        else if (move[ 0 ] == "B")
            ParseBishop( pieceStates, move, isWhiteMove, moveInfo );
        else if (move[ 0 ] == "R")
            ParseRook( pieceStates, move, isWhiteMove, moveInfo );
        else if (move[ 0 ] == "Q")
            ParseQueen( pieceStates, move, isWhiteMove, moveInfo );
        else if (move[ 0 ] == "K")
            ParseKing( pieceStates, move, isWhiteMove, moveInfo );
        else if (move == "0-1" || move == "1-0")
            moveInfo.isResigned = true;
        else if (move == "1/2-1/2")
            moveInfo.isDraw = true;
        else if (move[ 0 ] == "0")
            ParseCastling( pieceStates, move, isWhiteMove, moveInfo );

        return moveInfo;
    }

    function ParsePawn( pieceStates, move, isWhiteMove, moveInfo ) {
        moveInfo.isPawnMove = true;
        if (move.length == 2) {
            if (!isRank( move[ 1 ] )) {
                alert( move[ 1 ] + " がRankではありません" );
                return;
            }
            // 駒取りなしのポーンの移動
            // どのポーンの移動かを特定
            moveInfo.postFile = move[ 0 ];
            moveInfo.postRank = move[ 1 ];
            moveInfo.movedPieceKey = pieceStates.findKey( isWhiteMove, "p", moveInfo.postFile, moveInfo.postRank );
        } else if (move.length == 4) {
            // 駒取りありのポーンの移動
            if (move[ 1 ] != "x") {
                alert( move[ 1 ] + " がxではありません" );
                return;
            }
            if (!isFile( move[ 2 ] )) {
                alert( move[ 2 ] + " がFileではありません"  );
                return;
            }
            if (!isRank( move[ 3 ] )) {
                alert( move[ 3 ] + " がRankではありません" );
                return;
            }
            moveInfo.existsKilledPiece = true;
            // 1つの駒を取れるポーンが2つある可能性がある
            moveInfo.postFile = move[ 2 ];
            moveInfo.postRank = move[ 3 ];
            var op1 = new SearchOption( false, true, move[ 0 ] );
            moveInfo.movedPieceKey = pieceStates.findKey( isWhiteMove, "p", moveInfo.postFile, moveInfo.postRank, op1 );
            var op2 = new SearchOption( true, false );
            moveInfo.killedPieceKey = pieceStates.findKey( !isWhiteMove, "*", moveInfo.postFile, moveInfo.postRank, op2 );
        }
    }

    function ParseKnight( pieceStates, move, isWhiteMove, moveInfo ) {
        moveInfo.isKnightMove = true;
        ParseBase( pieceStates, move, isWhiteMove, moveInfo, "n" );
    }

    function ParseBishop( pieceStates, move, isWhiteMove, moveInfo ) {
        moveInfo.isBishopMove = true;
        ParseBase( pieceStates, move, isWhiteMove, moveInfo, "b" );
    }

    function ParseRook( pieceStates, move, isWhiteMove, moveInfo ) {
        moveInfo.isRookMove = true;
        ParseBase( pieceStates, move, isWhiteMove, moveInfo, "r" );
    }

    function ParseQueen( pieceStates, move, isWhiteMove, moveInfo ) {
        moveInfo.isQueenMove = true;
        ParseBase( pieceStates, move, isWhiteMove, moveInfo, "q" );
    }

    function ParseKing( pieceStates, move, isWhiteMove, moveInfo ) {
        moveInfo.isKingMove = true;
        ParseBase( pieceStates, move, isWhiteMove, moveInfo, "k" );
    }

    function ParseCastling( pieceStates, move, isWhiteMove, moveInfo ) {
        if (move == "0-0")
            moveInfo.isKingSideCastling = true;
        else if (move == "0-0-0")
            moveInfo.isQueenSideCastling = true;
    }

    function ParseBase( pieceStates, move, isWhiteMove, moveInfo, pieceType ) {
        if (move.length == 3) {
            // 駒取りなしの駒の移動
            if (!isFile( move[ 1 ] )) {
                alert( move[ 1 ] + " がFileではありません" );
                return;
            }
            if (!isRank( move[ 2 ] )) {
                alert( move[ 2 ] + " がRankではありません" );
                return;
            }
            moveInfo.postFile = move[ 1 ];
            moveInfo.postRank = move[ 2 ];
            moveInfo.movedPieceKey = pieceStates.findKey( isWhiteMove, pieceType, moveInfo.postFile, moveInfo.postRank );
        } else if (move.length == 4) {
            if (move[ 1 ] == "x") {
                // 駒取りありの駒の移動
                if (!isFile( move[ 2 ] )) {
                    alert( move[ 2 ] + " がFileではありません"  );
                    return;
                }
                if (!isRank( move[ 3 ] )) {
                    alert( move[ 3 ] + " がRankではありません" );
                    return;
                }
                moveInfo.existsKilledPiece = true;
                moveInfo.postFile = move[ 2 ];
                moveInfo.postRank = move[ 3 ];
                var op1 = new SearchOption( false, true );
                moveInfo.movedPieceKey = pieceStates.findKey( isWhiteMove, pieceType, moveInfo.postFile, moveInfo.postRank, op1 );
                var op2 = new SearchOption( true, false );
                moveInfo.killedPieceKey = pieceStates.findKey( !isWhiteMove, "*", moveInfo.postFile, moveInfo.postRank, op2 );
            } else {
                // 同じ場所に移動できる駒が2つある場合 (ナイト or ルーク)
                if (!isFile( move[ 1 ] )) {
                    alert( move[ 1 ] + " がFileではありません" );
                    return;
                }
                if (!isFile( move[ 2 ] )) {
                    alert( move[ 2 ] + " がFileではありません" );
                    return;
                }
                if (!isRank( move[ 3 ] )) {
                    alert( move[ 3 ] + " がRankではありません" );
                    return;
                }
                var op = new SearchOption( false, false, move[ 1 ] );
                moveInfo.postFile = move[ 2 ];
                moveInfo.postRank = move[ 3 ];
                moveInfo.movedPieceKey = pieceStates.findKey( isWhiteMove, pieceType, moveInfo.postFile, moveInfo.postRank, op );
            }
        } else if (move.length == 5) {
            // 例：Ncxe5 (ある駒を取れるナイトが2つある場合)
            if (!isFile( move[ 1 ] )) {
                alert( move[ 1 ] + " がFileではありません" );
                return;
            }
            if (move[ 2 ] != "x") {
                alert( move[ 2 ] + " がxではありません" );
                return;
            }
            if (!isFile( move[ 3 ] )) {
                alert( move[ 3 ] + " がFileではありません" );
                return;
            }
            if (!isRank( move[ 4 ] )) {
                alert( move[ 4 ] + " がRankではありません" );
                return;
            }
            moveInfo.existsKilledPiece = true;
            moveInfo.postFile = move[ 3 ];
            moveInfo.postRank = move[ 4 ];
            var op1 = new SearchOption( false, true, move[ 1 ] );
            moveInfo.movedPieceKey = pieceStates.findKey( isWhiteMove, pieceType, moveInfo.postFile, moveInfo.postRank, op );
            var op2 = new SearchOption( true, false );
            moveInfo.killedPieceKey = pieceStates.findKey( !isWhiteMove, "*", moveInfo.postFile, moveInfo.postRank, op2 );
        }
    }

    function isFile( file ) {
        return file == "a" || file == "b" || file == "c" || file == "d" ||
            file == "e" || file == "f" || file == "g" || file == "h";
    }

    function isRank( rank ) {
        return 1 <= rank && rank <= 8;
    }

    return MoveParser;
})();

//=============================================================================================================
// PieceState
//=============================================================================================================
var PieceState = (function () {
    function PieceState( file, rank, alives ) {
        this.file = file;
        this.rank = rank;
        this.alives = alives;
    }

    return PieceState;
})();

//=============================================================================================================
// PieceStateSet
//=============================================================================================================
var PieceStateSet = (function () {
    function PieceStateSet() {
        this.states = [];
        this.keys = [
            // White
            "wk", "wq", "wr1", "wr2", "wb1", "wb2", "wn1", "wn2",
            "wp1", "wp2", "wp3", "wp4", "wp5", "wp6", "wp7", "wp8",
            // Black
            "bk", "bq", "br1", "br2", "bb1", "bb2", "bn1", "bn2",
            "bp1", "bp2", "bp3", "bp4", "bp5", "bp6", "bp7", "bp8"
        ];
        this.moveParser = new MoveParser();
        this.positionUtil = new PositionUtility();
    }

    PieceStateSet.prototype.initialize = function () {
        var files = [ "a", "b", "c", "d", "e", "f", "g", "h" ];

        initializeWhiteStates( this.states, files );
        initializeBlackStates( this.states, files );
    }

    function initializeWhiteStates( states, files ) {
        // White King
        states["wk"] = new PieceState( "e", 1, true );
        // White Queen
        states["wq"] = new PieceState( "d", 1, true );
        // White Rooks
        states["wr1"] = new PieceState( "a", 1, true );
        states["wr2"] = new PieceState( "h", 1, true );
        // White Bishops
        states["wb1"] = new PieceState( "c", 1, true );
        states["wb2"] = new PieceState( "f", 1, true );
        // White Knights
        states["wn1"] = new PieceState( "b", 1, true );
        states["wn2"] = new PieceState( "g", 1, true );
        // White Pawns
        for (var i = 0; i < files.length; ++i)
            states["wp" + (i + 1).toString()] = new PieceState( files[ i ], 2, true );
    }

    function initializeBlackStates( states, files ) {
        // Black King
        states["bk"] = new PieceState( "e", 8, true );
        // Black Queen
        states["bq"] = new PieceState( "d", 8, true );
        // Black Rooks
        states["br1"] = new PieceState( "a", 8, true );
        states["br2"] = new PieceState( "h", 8, true );
        // Black Bishops
        states["bb1"] = new PieceState( "c", 8, true );
        states["bb2"] = new PieceState( "f", 8, true );
        // Black Knights
        states["bn1"] = new PieceState( "b", 8, true );
        states["bn2"] = new PieceState( "g", 8, true );
        // Black Pawns
        for (var i = 0; i < files.length; ++i)
            states["bp" + (i + 1).toString()] = new PieceState( files[ i ], 7, true );
    }

    PieceStateSet.prototype.update = function ( moves ) {
        this.initialize();
        for (var i = 0; i < moves.length; ++i) {
            var isWhiteMove = i % 2 == 0;
            var moveInfo = this.moveParser.Parse( this, moves[ i ], isWhiteMove );
            if (moveInfo.isResigned) {
                alert( (isWhiteMove ? "White" : "Black") + " is resigned." );
                return;
            } else if (moveInfo.isDraw) {
                alert( "Draw." );
                return;
            }
            if (!moveInfo.isQueenSideCastling && !moveInfo.isKingSideCastling) {
                if (!moveInfo.existsKilledPiece) {
                    this.states[ moveInfo.movedPieceKey ].file = moveInfo.postFile;
                    this.states[ moveInfo.movedPieceKey ].rank = moveInfo.postRank;
                } else {
                    this.states[ moveInfo.killedPieceKey ].alives = false;
                    this.states[ moveInfo.movedPieceKey ].file = moveInfo.postFile;
                    this.states[ moveInfo.movedPieceKey ].rank = moveInfo.postRank;
                }
            } else if (moveInfo.isQueenSideCastling) {
                if (isWhiteMove) {
                    this.states[ "wk" ].file = "c";
                    this.states[ "wr1" ].file = "d";
                    this.states[ "wk" ].rank = this.states[ "wr1" ].rank = 1;
                } else {
                    this.states[ "bk" ].file = "c";
                    this.states[ "br1" ].file = "d";
                    this.states[ "bk" ].rank = this.states[ "br1" ].rank = 8;
                }
            } else if (moveInfo.isKingSideCastling) {
                if (isWhiteMove) {
                    this.states[ "wk" ].file = "g";
                    this.states[ "wr2" ].file = "f";
                    this.states[ "wk" ].rank = this.states[ "wr1" ].rank = 1;
                } else {
                    this.states[ "bk" ].file = "g";
                    this.states[ "br2" ].file = "f";
                    this.states[ "bk" ].rank = this.states[ "br1" ].rank = 8;
                }
            }
            // チェックメイトの場合は動かしてから
            if (moveInfo.isCheckmate) {
                alert( "Checkmate." );
                return;
            }
        }
    }

    // 検索 (複数ある駒用 (Pawn, Rook, Knight, Bishop))
    PieceStateSet.prototype.findKey = function ( isWhitePiece, pieceType, postFile, postRank, searchOption ) {
        var keyPrefix = (isWhitePiece ? "w" : "b") + pieceType;
        var postX = this.positionUtil.toIndexFromFile( postFile );
        var postY = this.positionUtil.toIndexFromRank( postRank );

        for (var i = 0; i < this.keys.length; ++i) {
            var key = this.keys[ i ];
            var state = this.states[ key ];
            if (!state.alives)
                continue;

            var prevX = this.positionUtil.toIndexFromFile( state.file );
            var prevY = this.positionUtil.toIndexFromRank( state.rank );

            if (pieceType == "*") {
                // 駒取られの場合
                if (searchOption != undefined && searchOption.isNoMoving) {
                    if (prevX == postX && prevY == postY)
                        return key;
                }
            }
            if (key.substring( 0, 2 ) == keyPrefix) {
                // 指定fileの指定rankに移動可能か？
                if (pieceType == "p" && this.isPawnMovableTo( isWhitePiece, postX, postY, prevX, prevY, searchOption )) {
                    // 移動経路に駒がないかの判定 (ポーンが同じファイルに2つある場合)
                    if (!this.isHitAnyPiece( key, postX, postY, prevX, prevY ))
                        return key;
                } else if (pieceType == "n" && this.isKnightMovableTo( postX, postY, prevX, prevY, searchOption ))
                    return key;
                else if (pieceType == "b" && this.isBishopMovableTo( postX, postY, prevX, prevY ))
                    return key;
                else if (pieceType == "r" && this.isRookMovableTo( postX, postY, prevX, prevY, searchOption )) {
                    // 移動経路に駒がないかの判定 (ルークが2つある場合)
                    if (!this.isHitAnyPiece( key, postX, postY, prevX, prevY ))
                        return key;
                } else if (pieceType == "q" && this.isQueenMovableTo( postX, postY, prevX, prevY ))
                    return key;
                else if (pieceType == "k" && this.isKingMovableTo( postX, postY, prevX, prevY ))
                    return key;
            }
        }
        return null;
    }

    PieceStateSet.prototype.isPawnMovableTo = function ( isWhitePiece, postX, postY, prevX, prevY, searchOption ) {
        if (searchOption != undefined) {
            if (searchOption.isKilling) {
                // 駒取りを行った場合
                var vectors =
                    isWhitePiece ? [
                        new Vector( -1, 1 ), // yマイナス方向 → rank ではマイナス, インデックスではプラス
                        new Vector( 1, 1 )
                    ] : [
                        new Vector( -1, -1 ),
                        new Vector( 1, -1 )
                    ];
                for (var i = 0; i < vectors.length; ++i) {
                    var v = vectors[ i ];
                    if (postX + v.x == prevX && postY + v.y == prevY) {
                        // 移動可能なポーンが2つある可能性あり
                        if (searchOption.fixedPrevFile != undefined) {
                            var fixedPrevX = this.positionUtil.toIndexFromFile( searchOption.fixedPrevFile );
                            if (fixedPrevX == prevX)
                                return true;
                        } else
                            return true;
                    }
                }
            }
        } else {
            // 同一 file に2つ以上の駒がある場合 → ルークの判定と同様に移動経路チェックを呼出し元で行う
            if (prevX == postX)
                return true;
        }
        return false;
    }

    PieceStateSet.prototype.isKnightMovableTo = function ( postX, postY, prevX, prevY, searchOption ) {
        var vectors = [
            new Vector( 2, 1 ),
            new Vector( 1, 2 ),
            new Vector( -2, 1 ),
            new Vector( -1, 2 ),
            new Vector( -2, -1 ),
            new Vector( -1, -2 ),
            new Vector( 2, -1 ),
            new Vector( 1, -2 )
        ];

        if (searchOption != undefined && searchOption.fixedPrevFile != undefined) {
            var fixedPrevX = this.positionUtil.toIndexFromFile( searchOption.fixedPrevFile );
            if (fixedPrevX != prevX)
                return false;
        }
        for (var i = 0; i < vectors.length; ++i) {
            var v = vectors[ i ];
            if (postX + v.x == prevX && postY + v.y == prevY)
                return true;
        }

        return false;
    }

    // (同じ色の) 各ビショップの移動範囲は重複しない
    PieceStateSet.prototype.isBishopMovableTo = function ( postX, postY, prevX, prevY ) {
        var vectors = [
            new Vector( 1, 1 ), // 北東
            new Vector( -1, 1 ), // 北西
            new Vector( 1, -1 ), // 南西
            new Vector( -1, -1 ) // 南東
        ];

        for (var i = 0; i < vectors.length; ++i) {
            var v = vectors[ i ];
            for (var j = 1; j <= 8; ++j) {
                if (postX + j * v.x == prevX && postY + j * v.y == prevY)
                    return true;
            }
        }

        return false;
    }

    PieceStateSet.prototype.isRookMovableTo = function ( postX, postY, prevX, prevY, searchOption ) {
        var vectors = [
            new Vector( 1, 0 ), // 東
            new Vector( 0, 1 ), // 北
            new Vector( -1, 0 ), // 西
            new Vector( 0, -1 ) // 南
        ];

        if (searchOption != undefined && searchOption.fixedPrevFile != undefined) {
            var fixedPrevX = this.positionUtil.toIndexFromFile( searchOption.fixedPrevFile );
            if (fixedPrevX != prevX)
                return false;
        }
        for (var i = 0; i < vectors.length; ++i) {
            var v = vectors[ i ];
            for (var j = 1; j <= 8; ++j) {
                if (postX + j * v.x == prevX && postY + j * v.y == prevY)
                    return true;
            }
        }

        return false;
    }

    PieceStateSet.prototype.isQueenMovableTo = function ( postX, postY, prevX, prevY ) {
        var vectors = [
            new Vector( 1, 0 ), // 東
            new Vector( 1, 1 ), // 北東
            new Vector( 0, 1 ), // 北
            new Vector( -1, 1 ), // 北西
            new Vector( -1, 0 ), // 西
            new Vector( 1, -1 ), // 南西
            new Vector( 0, -1 ), // 南
            new Vector( -1, -1 ) // 南東
        ];

        for (var i = 0; i < vectors.length; ++i) {
            var v = vectors[ i ];
            for (var j = 1; j <= 8; ++j) {
                if (postX + j * v.x == prevX && postY + j * v.y == prevY)
                    return true;
            }
        }

        return false;
    }

    PieceStateSet.prototype.isKingMovableTo = function ( postX, postY, prevX, prevY ) {
        var vectors = [
            new Vector( 1, 0 ),
            new Vector( 1, 1 ),
            new Vector( 0, 1 ),
            new Vector( -1, 1 ),
            new Vector( -1, 0 ),
            new Vector( -1, -1 ),
            new Vector( 0, -1 ),
            new Vector( 1, -1 )
        ];

        for (var i = 0; i < vectors.length; ++i) {
            var v = vectors[ i ];
            if (postX + v.x == prevX && postY + v.y == prevY)
                return true;
        }

        return false;
    }

    PieceStateSet.prototype.isHitAnyPiece = function ( selfKey, postX, postY, prevX, prevY ) {
        var diff = new Vector( postX - prevX, postY - prevY );
        var v = new Vector( diff.x == 0 ? 0 : diff.x / Math.abs( diff.x ), diff.y == 0 ? 0 : diff.y / Math.abs( diff.y ) );
        var scanX = prevX + v.x;
        var scanY = prevY + v.y;
        while (scanX != postX || scanY != postY) {
            for (var i = 0; i < this.keys.length; ++i) {
                var key = this.keys[ i ];
                if (key == selfKey)
                    continue;
                var state = this.states[ key ];
                if (!state.alives)
                    continue;
                var x = this.positionUtil.toIndexFromFile( state.file );
                var y = this.positionUtil.toIndexFromRank( state.rank );
                if (scanX == x && scanY == y)
                    return true;
            }
            scanX += v.x;
            scanY += v.y;
        }

        return false;
    }

    return PieceStateSet;
})();

//=============================================================================================================
// PositionUtility
//=============================================================================================================
var PositionUtility = (function () {
    function PositionUtility() {
        this.files = [ "a", "b", "c", "d", "e", "f", "g", "h" ];
    }

    PositionUtility.prototype.toIndexFromFile = function ( file ) {
        return this.files.indexOf( file );
    }

    PositionUtility.prototype.toIndexFromRank = function ( rank ) {
        // 0 -> 8, 7 -> 1
        return 8 - rank;
    }

    PositionUtility.prototype.getFiles = function () {
        return this.files;
    }

    return PositionUtility;
})();

//=============================================================================================================
// Renderer
//=============================================================================================================
var Renderer = (function () {
    function Renderer( contexts ) {
        this.contexts = contexts;
        this.pieceSize = new Size( 45, 45 );
        this.boardSize = new Size( 360, 360 );
        this.offsetDrawing = this.pieceSize;
        this.positionUtil = new PositionUtility();
    }

    // 描画更新
    Renderer.prototype.render = function ( pieceStates, isWhiteView ) {
        this.contexts.back.clearRect( 0, 0, this.contexts.back.canvas.width, this.contexts.back.canvas.height );

        // レンダリング結果 (画像は非同期にレンダリング) をフロントバッファに送るためのタイミングの構成用
        window.sessionStorage.setItem( "countImages", "0" );

        this.renderCore( this.contexts, pieceStates, isWhiteView );
    }

    Renderer.prototype.renderCore = function ( contexts, pieceStates, isWhiteView ) {
        this.drawPieces( contexts, pieceStates, this.offsetDrawing, isWhiteView );
        this.drawChessBoard( contexts.back, this.offsetDrawing );
        this.drawPositionalNotations( contexts.back, new Size( 0, 0 ), isWhiteView );
    }

    Renderer.prototype.drawPieces = function ( contexts, pieceStates, offset, isWhiteView ) {
        for (var i = 0; i < pieceStates.keys.length; ++i) {
            var key = pieceStates.keys[ i ];
            var state = pieceStates.states[ key ];
            // html 直下に figures フォルダを配置する
            this.drawImage( contexts, pieceStates.keys.length, "figures/" + key.substring( 0, 2 ) + ".png", state, offset, isWhiteView );
        }
    }

    Renderer.prototype.drawImage = function ( contexts, pieceKeysLength, sourcePath, state, offset, isWhiteView ) {
        var size = this.pieceSize;
        var x = this.positionUtil.toIndexFromFile( state.file );
        var y = this.positionUtil.toIndexFromRank( state.rank );
        var alives = state.alives;

        var image = new Image();
        image.src = sourcePath;
        image.onload = function () {
            // 画像は非同期にレンダリング
            if (alives) {
                if (isWhiteView)
                    contexts.back.drawImage( image, offset.width + x * size.width, offset.height + y * size.height );
                else
                    contexts.back.drawImage( image, offset.width + (7 - x) * size.width, offset.height + (7 - y) * size.height );
            }

            var countImages = Number( window.sessionStorage.getItem( "countImages" ) );
            window.sessionStorage.setItem( "countImages", countImages + 1 );
            if (countImages + 1 == pieceKeysLength) {
                // 全ての画像の描画が完了 → バックバッファの内容をフロントバッファに転送
                // (ダブルバッファリング (http://d.hatena.ne.jp/hypercrab/20111014/1318558535))
                var imageData = contexts.back.getImageData( 0, 0, contexts.back.canvas.width, contexts.back.canvas.height );
                contexts.front.putImageData( imageData, 0, 0 );
            }
        }
    }

    Renderer.prototype.drawPositionalNotations = function ( context, offset, isWhiteView ) {
        var fileMargin = new Size( 18, 30 );
        var rankMargin = new Size( 20, 30 );

        context.font = "20px 'ＭＳ Ｐゴシック'";
        context.fillStyle = "black";

        // File
        var files = this.positionUtil.getFiles();
        for (var j = 0; j < files.length; ++j) {
            if (isWhiteView) {
                context.fillText( files[ j ], offset.width + fileMargin.width + (j + 1) * this.pieceSize.width, offset.height + fileMargin.height );
                context.fillText( files[ j ], offset.width + fileMargin.width + (j + 1) * this.pieceSize.width, offset.height + (this.boardSize.height + this.pieceSize.height - 5) + fileMargin.height );
            } else {
                context.fillText( files[ j ], offset.width + fileMargin.width + (7 - j + 1) * this.pieceSize.width, offset.height + fileMargin.height );
                context.fillText( files[ j ], offset.width + fileMargin.width + (7 - j + 1) * this.pieceSize.width, offset.height + (this.boardSize.height + this.pieceSize.height - 5) + fileMargin.height );
            }
        }

        // Rank
        for (var i = 1; i <= 8; ++i) {
            if (isWhiteView) {
                context.fillText( i.toString(), offset.width + rankMargin.width, offset.height + rankMargin.height + (8 - i + 1) * this.pieceSize.height );
                context.fillText( i.toString(), offset.width + (this.boardSize.width + this.pieceSize.width - 5) + rankMargin.width, offset.height + rankMargin.height + (8 - i + 1) * this.pieceSize.height );
            } else {
                context.fillText( i.toString(), offset.width + rankMargin.width, offset.height + rankMargin.height + i * this.pieceSize.height );
                context.fillText( i.toString(), offset.width + (this.boardSize.width + this.pieceSize.width - 5) + rankMargin.width, offset.height + rankMargin.height + i * this.pieceSize.height );
            }
        }
    }

    Renderer.prototype.drawChessBoard = function ( context, offset ) {
        context.beginPath();

        context.moveTo( offset.width, offset.height );
        // 周囲
        context.lineTo( offset.width + this.boardSize.width, offset.height );
        context.lineTo( offset.width + this.boardSize.width, offset.height + this.boardSize.height );
        context.lineTo( offset.width, offset.height + this.boardSize.height );
        context.lineTo( offset.width, offset.height );
        // 縦線
        for (var i = 1; i < 8; ++i) {
            context.moveTo( offset.width + i * this.pieceSize.width, offset.height );
            context.lineTo( offset.width + i * this.pieceSize.width, offset.height + this.boardSize.height );
        }
        // 横線
        for (var j = 1; j < 8; ++j) {
            context.moveTo( offset.width, offset.height + j * this.pieceSize.height );
            context.lineTo( offset.width + this.boardSize.width, offset.height + j * this.pieceSize.height );
        }
        // 塗りつぶし
        context.fillStyle = 'rgb(252, 205, 161)';
        for (var i = 0; i < 8; ++i) {
            for (var j = 0; j < 8; ++j) {
                if ((i + j) % 2 == 0)
                    context.fillRect( offset.width + i * this.pieceSize.width + 1, offset.height + j * this.pieceSize.height + 1, this.pieceSize.width - 1, this.pieceSize.height - 1 );
            }
        }
        context.fillStyle = 'rgb(209, 139, 70)';
        for (var i = 0; i < 8; ++i) {
            for (var j = 0; j < 8; ++j) {
                if ((i + j) % 2 == 1)
                    context.fillRect( offset.width + i * this.pieceSize.width + 1, offset.height + j * this.pieceSize.height + 1, this.pieceSize.width - 1, this.pieceSize.height - 1 );
            }
        }

        context.stroke();
    }

    return Renderer;
})();

//=============================================================================================================
// SearchOption
//=============================================================================================================
var SearchOption = (function () {
    function SearchOption( isNoMoving, isKilling, fixedPrevFile, fixedPrevRank ) {
        this.isNoMoving = isNoMoving;
        this.isKilling = isKilling;
        this.fixedPrevFile = fixedPrevFile;
        this.fixedPrevRank = fixedPrevRank;
    }

    return SearchOption;
})();

//=============================================================================================================
// Size
//=============================================================================================================
var Size = (function () {
    function Size( width, height ) {
        this.width = width;
        this.height = height;
    }

    return Size;
})();

//=============================================================================================================
// Vector
//=============================================================================================================
var Vector = (function () {
    function Vector( x, y ) {
        this.x = x;
        this.y = y;
    }

    return Vector;
})();
