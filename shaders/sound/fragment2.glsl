varying vec2 vUV;
uniform float uTime;
uniform float uPixelWidth;

void main()
{
    float widthScale = uPixelWidth/1180.0;
    float center = 0.5 + sin(vUV.x * 17.0  + uTime * 2.0) * 0.1;
    center += cos(vUV.x * 7.0) * 0.05;
    float width = 0.20;
    float strength = 1.0 - smoothstep(center - width, center, abs(vUV.y - 0.5 + sin(vUV.x * 7.0 + uTime * 4.0) * 0.05) * 1.5 + 0.1);
    strength *= step(0.6, fract(vUV.x * 60.0 * widthScale + uTime));
    float color = (0.01) / distance(vUV.y + sin(vUV.x * 11.0 + uTime * 3.0) * 0.02 + sin(vUV.x * 19.0 + uTime * 7.0) * 0.01, 0.5) - 0.2;
    color = mix(0.8, 0.95, color);
    gl_FragColor = vec4(vec3(color), strength);
}