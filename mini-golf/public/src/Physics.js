export class Physics {
    static checkWallCollision(ball, walls) {
        for (const wall of walls) {
            // ボールの中心が壁の矩形内に入っているか
            const isInsideX = ball.x >= wall.x && ball.x <= wall.x + wall.width;
            const isInsideY = ball.y >= wall.y && ball.y <= wall.y + wall.height;

            // 矩形上の最もボールに近い点を探す
            const closestX = Math.max(wall.x, Math.min(ball.x, wall.x + wall.width));
            const closestY = Math.max(wall.y, Math.min(ball.y, wall.y + wall.height));

            const dx = ball.x - closestX;
            const dy = ball.y - closestY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // ケース1: ボールの中心が完全に壁の中に入ってしまった場合（貫通対策）
            if (isInsideX && isInsideY) {
                // 4つの端のうち、最も近い場所を探して押し出す
                const distToLeft = ball.x - wall.x;
                const distToRight = (wall.x + wall.width) - ball.x;
                const distToTop = ball.y - wall.y;
                const distToBottom = (wall.y + wall.height) - ball.y;

                const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

                if (minDist === distToLeft) {
                    ball.x = wall.x - ball.radius;
                    ball.vx *= -0.8;
                } else if (minDist === distToRight) {
                    ball.x = wall.x + wall.width + ball.radius;
                    ball.vx *= -0.8;
                } else if (minDist === distToTop) {
                    ball.y = wall.y - ball.radius;
                    ball.vy *= -0.8;
                } else {
                    ball.y = wall.y + wall.height + ball.radius;
                    ball.vy *= -0.8;
                }
                continue;
            }

            // ケース2: 通常の円と矩形の衝突（表面での接触）
            if (distance < ball.radius && distance > 0) {
                // どの面から当たったかを判定
                if (Math.abs(dx) > Math.abs(dy)) {
                    // 左右の面
                    ball.vx *= -0.8;
                    ball.x = dx > 0 ? closestX + ball.radius : closestX - ball.radius;
                } else {
                    // 上下の面
                    ball.vy *= -0.8;
                    ball.y = dy > 0 ? closestY + ball.radius : closestY - ball.radius;
                }
            }
        }
    }

    static checkCupIn(ball, cup) {
        const dx = ball.x - cup.x;
        const dy = ball.y - cup.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // カップの中心に近く、かつ速度が十分に遅い場合にカップイン
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        return distance < cup.radius && speed < 5;
    }
}
