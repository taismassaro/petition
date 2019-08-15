(function() {
    const main = $("main");
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

            console.log("Mouse down:", event);
            console.log(position.x, position.y);
        });

        canvas.on("mousemove", event => {
            if (event.buttons === 1) {
                drawLine();
            }
        });

        canvas.on("mouseup", event => {
            canvas.off("mousemove");
            signature = canvas[0].toDataURL();
            $("input[type='hidden']").val(signature);
            console.log("Signature URL:", signature);
        });

        clear.on("click", () => {
            console.log("Clear");
            canvas.on("mousemove");
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
            ctx.lineCap = "round";
            ctx.moveTo(position.x, position.y);
            setPosition(event);
            ctx.lineTo(position.x, position.y);
            ctx.stroke();
        }
    }
})();
