import k from "../kaplayCtx";
import { makeOlik } from "../entities/sonic";
import { makeMotobug } from "../entities/motobug";
import { makeRing } from "../entities/ring";

export default function game() {
	k.setGravity(3100);
	const citySfx = k.play("city", { volume: 0.2, loop: true });
	const bgPieceWidth = 1920;
	const bgPieces = [
		k.add([k.sprite("chemical-bg"), k.pos(0, 0), k.scale(2), k.opacity(0.8)]),
		k.add([
			k.sprite("chemical-bg"),
			k.pos(bgPieceWidth * 2, 0),
			k.scale(2),
			k.opacity(0.8),
		]),
	];

	const platformWidth = 1280;
	const platforms = [
		k.add([k.sprite("platforms"), k.pos(0, 450), k.scale(4)]),
		k.add([k.sprite("platforms"), k.pos(platformWidth, 450), k.scale(4)]),
	];

	let score = 0;
	let scoreMultiplier = 0;

	const scoreText = k.add([
		k.text("SCORE : 0", { font: "mania", size: 72 }),
		k.pos(20, 20),
	]);

	const olik = makeOlik(k.vec2(200, 745));
	olik.setControls();
	olik.setEvents();
	olik.onCollide("enemy", (enemy) => {
		if (!olik.isGrounded()) {
			k.play("destroy", { volume: 0.5 });
			k.play("hyper-ring", { volume: 0.5 });
			k.destroy(enemy);
			olik.play("jump");
			olik.jump();
			scoreMultiplier += 1;
			score += 10 * scoreMultiplier;
			scoreText.text = `SCORE: ${score}`;
			if (scoreMultiplier === 1) olik.ringCollectUI.text = "+10";
			if (scoreMultiplier > 1) olik.ringCollectUI.text = `x${scoreMultiplier}`;
			k.wait(1, () => {
				olik.ringCollectUI.text = "";
			});
			return;
		}

		k.play("hurt", { volume: 0.5 });
		k.setData("current-score", score);
		k.go("gameover", citySfx);
	});
	olik.onCollide("ring", (ring) => {
		k.play("ring", { volume: 0.5 });
		k.destroy(ring);
		score++;
		scoreText.text = `SCORE: ${score}`;
		olik.ringCollectUI.text = "+1";
		k.wait(1, () => (olik.ringCollectUI.text = ""));
	});
	let gameSpeed = 300;
	k.loop(1, () => {
		gameSpeed += 50;
	});

	const spawnMotoBug = () => {
		const motoBug = makeMotobug(k.vec2(1950, 773));
		motoBug.onUpdate(() => {
			if (gameSpeed < 3000) {
				motoBug.move(-(gameSpeed + 300), 0);
				return;
			}

			motoBug.move(-gameSpeed, 0);
		});

		motoBug.onExitScreen(() => {
			if (motoBug.pos.x < 0) k.destroy(motoBug);
		});

		const waitTime = k.rand(0.5, 2.5);
		k.wait(waitTime, spawnMotoBug);
	};

	spawnMotoBug();

	const spawnRing = () => {
		const ring = makeRing(k.vec2(1950, 745));
		ring.onUpdate(() => {
			ring.move(-gameSpeed, 0);
		});

		ring.onExitScreen(() => {
			if (ring.pos.x < 0) k.destroy(ring);
		});

		const waitTime = k.rand(0.5, 3);
		k.wait(waitTime, spawnRing);
	};

	spawnRing();

	k.add([
		k.rect(1920, 300),
		k.opacity(0),
		k.area(),
		k.pos(0, 832),
		k.body({ isStatic: true }),
	]);

	k.onUpdate(() => {
		if (olik.isGrounded()) scoreMultiplier = 0;

		if (bgPieces[1].pos.x < 0) {
			bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth * 2, 0);
			bgPieces.push(bgPieces.shift());
		}

		bgPieces[0].move(-100, 0);
		bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, 0);

		// for jump effect
		bgPieces[0].moveTo(bgPieces[0].pos.x, -olik.pos.y / 10 - 50);
		bgPieces[1].moveTo(bgPieces[1].pos.x, -olik.pos.y / 10 - 50);

		const platformWidth = 1280;
		if (platforms[1].pos.x < 0) {
			platforms[0].moveTo(platforms[1].pos.x + platformWidth * 4, 450);
			platforms.push(platforms.shift());
		}

		platforms[0].move(-gameSpeed, 0);
		platforms[1].moveTo(platforms[0].pos.x + platformWidth * 4, 450);
	});
}
