let canvas, ctx;
let B_s = [];
let points = [];
let num = 0; // 记录顶点数
let r = 2;
let click_point = -1;
let c_width=800, c_height=800;
let knots = [];

window.onload = function()
{
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    clickInit();

    $(document).keydown(function(e){
        if(e.which === 66)
        {
            // b
            draw_B();
        }

        if(e.which === 67)
        {
            // c
            clear();
        }
    });


    // let points = [
    //     [100, 100],
    //     [200, 200],
    //     [300, 100],
    //     [400, 200]
    // ];
    //
    // for(let i=0; i<points.length; i++)
    // {
    //     drawCircle(points[i][0], points[i][1], 2, 'red');
    // }

};

function draw_B()
{
    draw();
    let degree = 2;
    let knot_num = num + degree +1;
    let k = degree + 1;

    let first = true;
    B_s = [];

    if(!knots.length)
    {
        let knot = 0;
        for(let i=0; i<knot_num; i++)
        {
            if(i < k)
            {
                knots.push(0);
            }else if(i < knot_num-k)
            {
                knot++;
                knots.push(knot);

            }else
            {
                if(first)
                {
                    first = false;
                    knot++;
                }
                knots.push(knot);
            }
        }
    }

    for(let t=0; t<1; t+=0.01) {
        B_s.push(B_spline(t, degree, points, knots));
    }

    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.moveTo(B_s[0][0], B_s[0][1]);
    for(let i=0; i<B_s.length; i++)
    {
        ctx.lineTo(B_s[i][0], B_s[i][1]);
    }
    ctx.stroke();
    let s_knot = knots.join(',');
    $('#knots').val(s_knot);
    knots = [];
}

function clear()
{
    ctx.clearRect(0, 0, c_width, c_height);
    points = [];
    num = 0; // 记录顶点数
    click_point = -1;
}

function clickInit() {
    const c = document.getElementById("canvas");
    c.onmousedown = onClick;
    c.onmousemove = onMove;
    c.onmouseup = onUp;
}

function onClick(e)
{
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    if(e.shiftKey)
    {
        points.push([x,y]);
        drawCircle(x,y);
        num ++;
    }else
    {
        for(let i = 0; i<points.length; i++)
        {
            if(cal_distance(x, y, points[i][0], points[i][1]) < 10)
            {
                click_point = i;
            }
        }
    }
}

function onMove(e)
{
    if(click_point !== -1)
    {
        const x = e.clientX - canvas.getBoundingClientRect().left;
        const y = e.clientY - canvas.getBoundingClientRect().top;
        points[click_point][0] = x;
        points[click_point][1] = y;
        draw_B();
    }
}


function onUp(e)
{
    if(click_point !== -1)
    {
        click_point = -1;
    }

}

function change_konts()
{
    let input_s = $('#knots').val();
    knots = input_s.split(',');
    for(let i=0; i<knots.length; i++)
    {
        knots[i] = parseInt(knots[i]);
    }
    // console.log(knots);
    draw_B();
}

function draw()
{
    ctx.clearRect(0, 0, c_width, c_height);
    for(let i=0; i<points.length; i++)
    {
        drawCircle(points[i][0],points[i][1]);
    }
}

function B_spline(t, degree, points, knots, weights) {

    let i,j,s,l;
    let n = points.length;    // 点的数目
    let d = points[0].length; // 维数
    let k = degree+1; //阶数

    if(!weights) {
        // 如果没有权重，则初始化权重
        weights = [];
        for(i=0; i<n; i++) {
            weights[i] = 1;
        }
    }

    // 将t映射到定义B样条的定义域
    let low  = knots[degree];
    let high = knots[n];
    t = t * (high - low) + low;

    // 将t固定到区间
    for(s=degree; s<n; s++) {
        if(t >= knots[s] && t <= knots[s+1]) {
            break;
        }
    }

    // 转换到齐次坐标系，为了方便计算权重
    let v = [];
    for(i=0; i<n; i++) {
        v[i] = [];
        for(j=0; j<d; j++) {
            v[i][j] = points[i][j] * weights[i];
        }
        v[i][d] = weights[i];
    }

    let alpha;
    for(l=1; l<=k; l++) {
        for(i=s; i>s-k+l; i--) {
            alpha = (t - knots[i]) / (knots[i+k-l] - knots[i]);

            for(j=0; j<d+1; j++) {
                v[i][j] = alpha * v[i][j] + (1 - alpha) * v[i-1][j];
            }
        }
    }

    // 转换到正常坐标系
    let result = [];
    for(i=0; i<d; i++) {
        result[i] = v[s][i] / v[s][d];
    }

    return result;
}

function cal_distance(x0, y0, x1, y1)
{
    return Math.sqrt(Math.pow((x1-x0),2) + Math.pow((y1-y0),2));
}

function drawCircle(x, y)
{
    ctx.beginPath();
    ctx.arc(x,y,r,0,360,false);
    ctx.fillStyle='red';
    ctx.fill();//画实心圆
    ctx.closePath();
}