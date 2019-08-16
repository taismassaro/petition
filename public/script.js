const canvas = $("#signature");
const clear = $("button[name='clear']");

if (canvas.length) {
    const ctx = canvas[0].getContext("2d");

    let position = {
        x: 0,
        y: 0
    };

    let signature;

    ///// SIGNATURE EVENTS /////
    canvas.on("mousedown", event => {
        setPosition(event);
        ctx.beginPath();
        console.log("Mouse down:", event);
        console.log(position.x, position.y);
    });

    canvas.on("mousemove", event => {
        if (event.buttons === 1) {
            drawLine();
        }
    });

    canvas.on("mouseup", () => {
        // canvas.off("mousemove");
        ctx.closePath();
        signature = canvas[0].toDataURL();
        $("input[type='hidden']").val(signature);
        console.log("Signature URL:", signature);
    });

    clear.on("click", () => {
        console.log("Clear");
        $("input[type='hidden']").val(null);
        ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
    });

    ///// SIGNATURE CANVAS FUNCTIONS /////

    function setPosition(event) {
        position.x = event.offsetX;
        position.y = event.offsetY;
    }
    function drawLine() {
        console.log("Drawing");
        ctx.strokeStyle = "rgb(38, 17, 142)";
        ctx.lineWidth = 1;
        // ctx.lineCap = "round";
        // ctx.lineJoin = "round";
        ctx.moveTo(position.x, position.y);
        setPosition(event);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
    }
}
