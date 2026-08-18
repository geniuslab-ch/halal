import { NextResponse } from "next/server";

const BASE64_PNG = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAABlBMVEUbXiBDoEffBM5AAAABn0lEQVR42u3d0U3EQBAE0an8kyYCJGBtj4urjqCfdF/g7ZkppZRSyj8Oxs7fx9z9/Qp+E3f71xn4a9zt32HgPO72mwaujLz+8wTuiL3/cwLui7z+IwRwC0At4JnY+98mALWAZ2Pvf7kA3AJwC8AtALcA3AJwC8AtALcA3AKQC+wAcAvALQC5wA4AtwDcApAL7ACQC+wAcAtALrADQC6wA0AusANALgiwDAC5wA4AuSDAMgDkggDLAJALAiwDQC4IEOAMAHJBgAAfDgC5IECAAAECBAgQ4IMBkKCfUIAAAQIECBAgwBqgP+4GCGAH9G/WAB8P6HObAKeAPvoLcAro0+MAp4AeQKwDegQU4BTQU8R1QM9x1wE9SV8H6FcNGsbYBzQOsw7Q7wv5F54aCdsH6Hfm/Et/jUXuA/R7o/7FV//mrn/12L877V/+9m+v+9fv/fcH/Bcg/Dc4Rn8FZfx3aPyXgEZ/i2n817D898hGfxHuRsI8F3v/0d+lvJwwK5HXv8owy5HXPzPMe+Ju/wfDvDTq8j9RjC/GzqWUUspj+QJ8vFqyAA7HowAAAABJRU5ErkJggg==";

export function GET() {
  const buffer = Buffer.from(BASE64_PNG, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
