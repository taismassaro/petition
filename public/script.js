const canvas = $("canvas");
const canvasContainer = $(".canvas");
const clear = $("button[name='clear']");

if (canvas.length) {
    const ctx = canvas[0].getContext("2d");
    resizeCanvas();

    $(window).on("resize orientationchange", resizeCanvas);
    console.log(ctx);

    let position = {
        x: 0,
        y: 0
    };

    let signature;

    ///// SIGNATURE EVENTS /////
    canvas.on("mousedown", event => {
        setPosition(event);
        ctx.beginPath();
    });

    canvas.on("mousemove", event => {
        if (event.buttons === 1) {
            drawLine();
        }
    });

    canvas.on("mouseup", () => {
        ctx.closePath();
        signature = canvas[0].toDataURL();
        $("input[name='signature']").val(signature);
        console.log("Signature URL:", signature);
    });

    clear.on("click", () => {
        console.log("Clear");
        $("input[name='signature']").val(null);
        ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
    });

    ///// SIGNATURE CANVAS FUNCTIONS /////

    function resizeCanvas() {
        ctx.canvas.width = canvasContainer[0].offsetWidth;
        ctx.canvas.height = canvasContainer[0].offsetHeight;
    }

    function setPosition(event) {
        position.x = event.offsetX;
        position.y = event.offsetY;
    }
    function drawLine() {
        console.log("Drawing");
        ctx.strokeStyle = "#FF5722";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(position.x, position.y);
        setPosition(event);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
    }
}
