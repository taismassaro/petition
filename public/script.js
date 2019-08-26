const canvas = $("canvas");
const canvasContainer = $(".canvas");
const signatureInput = $("input[name='signature']");
const clear = $("button[name='clear']");
const submit = $("button[name='sign']");

// $(window).bind("pageshow", function(event) {
//     if (event.originalEvent.persisted) {
//         window.location.reload();
//     } else if (performance.navigation.type == 2) {
//         location.reload(true);
//     }
// });

if (canvas.length) {
    const ctx = canvas[0].getContext("2d");
    resizeCanvas();

    $(window).on("resize orientationchange", resizeCanvas);

    let position = {
        x: 0,
        y: 0
    };
    let signature;

    ///// SIGNATURE EVENTS /////

    canvas.on("mousedown touchstart", event => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === "touchstart") {
            setPosition(event, "touch");
        } else {
            setPosition(event);
        }
    });

    canvas.on("mousemove touchmove", event => {
        event.preventDefault();
        if (event.type === "touchmove") {
            drawLine("touch");
        } else if (event.buttons === 1) {
            drawLine();
        }
    });

    $(document).on("mouseup touchend", () => {
        signature = canvas[0].toDataURL();
        signatureInput.val(signature);
    });

    clear.on("click", () => {
        clearCanvas();
    });

    ///// CANVAS FUNCTIONS /////

    function resizeCanvas() {
        ctx.canvas.width = canvasContainer[0].offsetWidth;
        ctx.canvas.height = canvasContainer[0].offsetHeight;
    }

    function clearCanvas() {
        signatureInput.val(null);
        ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
        submit.prop("disabled", true);
    }

    function setPosition(event, touch) {
        if (touch && event.targetTouches.length === 1) {
            let touch = event.targetTouches[0];
            position.x = touch.pageX - touch.target.offsetLeft;
            position.y = touch.pageY - touch.target.offsetTop;
        } else {
            position.x = event.offsetX;
            position.y = event.offsetY;
        }
    }
    function drawLine(touch) {
        submit.prop("disabled", false);
        ctx.strokeStyle = "#FF5722";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
        if (touch) {
            setPosition(event, touch);
        } else {
            setPosition(event);
        }
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
        ctx.closePath();
    }
}
