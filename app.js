class Step5 {
  run() {
    validate();

    const c = new Step4().run().cement;
    const w = effectiveWater();

    const vc = c / (num('sgCement') * 1000);
    const vw = w / 1000;
    const va = num('air') / 100;

    const agg = 1 - vc - vw - va;

    if (agg <= 0) {
      throw Error('حجم باقی‌مانده برای سنگ‌دانه مثبت نیست.');
    }

    const vg = agg * num('coarseShare');
    const vs = agg - vg;

    // وزن خشک سنگ‌دانه‌ها بر مبنای حجم مطلق
    const drySand = vs * num('sgSand') * 1000;
    const dryGravel = vg * num('sgGravel') * 1000;

    const admixtureMass = c * num('admixturePct') / 100;

    return {
      c,
      w,
      drySand,
      dryGravel,
      admixtureMass,
      vc,
      vw,
      va,
      vs,
      vg,
      volume: vc + vw + va + vs + vg
    };
  }
}
