// chess_frame.js
var Size = (function () {
    function Size( width, height ) {
        this.width = width;
        this.height = height;
    }

    return Size;
})();

var PieceState = (function () {
    function PieceState( x, y, alives ) {
        this.x = x;
        this.y = y;
        this.alives = alives;
    }

    return PieceState;
})();

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
            var move = moves[ i ];
            alert( move );
        }
        //this.states["wp5"].y = 3;
    }

    return PieceStateSet;
})();

var ChessFrame = (function () {
    function ChessFrame() {
        this.contexts = {
            back: document.getElementById( "backCanvas" ).getContext( "2d" ),
            front: document.getElementById( "frontCanvas" ).getContext( "2d" )
        };
        this.pieceSize = new Size( 45, 45 );
        this.boardSize = new Size( 360, 360 );
        this.offsetDrawing = this.pieceSize;
        this.files = [ "a", "b", "c", "d", "e", "f", "g", "h" ];
        this.pieceStates = new PieceStateSet();
        this.moves = [];
        this.countSteps = -1;
    }

    ChessFrame.prototype.initialize = function ( moves ) {
        document.getElementById( "backCanvas" ).style.display = "none";
        this.pieceStates.initialize();
        this.initializeEventHandlers();
        this.moves = moves;
        this.updateButtonStates();
        this.render();
    }

    ChessFrame.prototype.initializeEventHandlers = function () {
        // HTMLCanvasElement >  Element > Node > EventTarget.addEventListener
        this.contexts.front.canvas.addEventListener( "click", this.onClicked, false );
    }

    ChessFrame.prototype.onClicked = function (e) {
        // Canvasの左上を (0, 0) とした相対座標の取得 (https://qiita.com/nekoneko-wanwan/items/9af7fb34d0fb7f9fc870)
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        //alert( "(x, y) = (" + x + ", " + y + ")" );
    }

    ChessFrame.prototype.goPrev = function () {
        if (this.countSteps <= -1)
            return;
        --this.countSteps;
        this.update();
        this.render();
    }

    ChessFrame.prototype.goNext = function () {
        if (this.moves.length <= this.countSteps)
            return;
        ++this.countSteps;
        this.update();
        this.render();
    }

    ChessFrame.prototype.updateMovesDisplay = function () {
        var movesDisplay = "";
        for (var i = 0; i <= this.countSteps; ++i) {
            if (i == 0)
                movesDisplay = this.moves[ i ];
            else
                movesDisplay += "\r\n" + this.moves[ i ];
        }
        document.getElementById( "movesDisplay" ).value = movesDisplay;
    }

    ChessFrame.prototype.updateButtonStates = function () {
        document.getElementById( "prevButton" ).disabled = this.countSteps <= -1;
        document.getElementById( "nextButton" ).disabled = this.moves.length - 1 <= this.countSteps;
    }

    ChessFrame.prototype.update = function () {
        this.updateButtonStates();
        this.updateMovesDisplay();

        var partialMoves = [];
        for (var i = 0; i <= this.countSteps; ++i)
            partialMoves.push( this.moves[ i ] );

        this.pieceStates.update( partialMoves );
    }

    // 描画更新
    ChessFrame.prototype.render = function () {
        this.contexts.back.clearRect( 0, 0, this.contexts.back.canvas.width, this.contexts.back.canvas.height );

        // レンダリング結果 (画像は非同期にレンダリング) をフロントバッファに送るためのタイミングの構成用
        window.sessionStorage.setItem( "countImages", "0" );

        this.renderCore( this.contexts );
    }

    ChessFrame.prototype.renderCore = function ( contexts ) {
        this.drawPieces( contexts, this.offsetDrawing );
        this.drawChessBoard( contexts.back, this.offsetDrawing );
        this.drawPositionalNotation( contexts.back, new Size( 0, 0 ) );
    }

    ChessFrame.prototype.getX = function ( x ) {
        return this.files.indexOf( x );
    }

    ChessFrame.prototype.getY = function ( y ) {
        return 8 - y;  // 0 -> 8, 7 -> 1
    }

    ChessFrame.prototype.drawPieces = function ( contexts, offset ) {
        for (var i = 0; i < this.pieceStates.keys.length; ++i) {
            var key = this.pieceStates.keys[ i ];
            var state = this.pieceStates.states[ key ];
            // html 直下に figures フォルダを配置する
            this.drawImage( contexts, "figures/" + key.substring( 0, 2 ) + ".png", state, offset );
        }
    }

    ChessFrame.prototype.drawImage = function ( contexts, sourcePath, state, offset ) {
        var size = this.pieceSize;
        var pieceStates = this.pieceStates;

        var x = this.getX( state.x );
        var y = this.getY( state.y );
        var alives = state.alives;

        var image = new Image();
        image.src = sourcePath;
        image.onload = function () {
            // 画像は非同期にレンダリング
            if (alives)
                contexts.back.drawImage( image, offset.width + x * size.width, offset.height + y * size.height );

            var countImages = Number( window.sessionStorage.getItem( "countImages" ) );
            window.sessionStorage.setItem( "countImages", countImages + 1 );
            if (countImages + 1 == pieceStates.keys.length) {
                // 全ての画像の描画が完了 → バックバッファの内容をフロントバッファに転送
                // (ダブルバッファリング (http://d.hatena.ne.jp/hypercrab/20111014/1318558535))
                var imageData = contexts.back.getImageData( 0, 0, contexts.back.canvas.width, contexts.back.canvas.height );
                contexts.front.putImageData( imageData, 0, 0 );
            }
        }
    }

    ChessFrame.prototype.drawPositionalNotation = function ( context, offset ) {
        var fileMargin = new Size( 18, 30 );
        var rankMargin = new Size( 20, 30 );

        context.font = "20px 'ＭＳ Ｐゴシック'";
        context.fillStyle = "black";

        // File
        for (var j = 0; j < this.files.length; ++j) {
            context.fillText( this.files[ j ], offset.width + fileMargin.width + (j + 1) * this.pieceSize.width, offset.height + fileMargin.height );
            context.fillText( this.files[ j ], offset.width + fileMargin.width + (j + 1) * this.pieceSize.width, offset.height + (this.boardSize.height + this.pieceSize.height - 5) + fileMargin.height );
        }

        // Rank
        for (var i = 1; i <= 8; ++i) {
            context.fillText( i.toString(), offset.width + rankMargin.width, offset.height + rankMargin.height + (8 - i + 1) * this.pieceSize.height );
            context.fillText( i.toString(), offset.width + (this.boardSize.width + this.pieceSize.width - 5) + rankMargin.width, offset.height + rankMargin.height + (8 - i + 1) * this.pieceSize.height );
        }
    }

    ChessFrame.prototype.drawChessBoard = function ( context, offset ) {
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

    return ChessFrame;
})();
