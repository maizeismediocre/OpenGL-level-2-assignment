// FRAGMENT SHADER

#version 330

// Materials

uniform vec3 materialAmbient;

uniform vec3 materialDiffuse;

uniform vec3 materialSpecular;

uniform float shininess;


// View Matrix

uniform mat4 matrixView;

in vec4 color;
in vec2 texCoord0;
out vec4 outColor;
in vec4 position;
in vec3 normal;
in vec3 texCoordCubeMap;

in vec4 shadowCoord;
uniform sampler2DShadow shadowMap;

uniform samplerCube textureCubeMap;
uniform float reflectionPower;

struct POINT
{
vec3 position;
vec3 diffuse;
vec3 specular;
};

uniform POINT lightPoint1 , lightPoint2;

vec4 PointLight(POINT light)
{
// Calculate Point Light

vec4 color = vec4(0, 0, 0, 0);

    vec4 lightPos = vec4(light.position, 1.0);


    vec4 transformedLightPos = matrixView * lightPos;

   
    vec3 L = normalize((transformedLightPos - position).xyz);

    
    float NdotL = dot(normal, L);

   
    color += vec4(materialDiffuse * light.diffuse, 1) * max(NdotL, 0);

    vec3 V = normalize(-position.xyz);
    vec3 R = reflect(-L, normal);
    float RdotV = dot(R, V);
    color += vec4(materialSpecular * light.specular * pow(max(RdotV, 0), shininess), 1);
    return color;
}
uniform sampler2D texture0;
void main(void) 
{
    outColor = color;
    outColor = mix(outColor * texture(texture0, texCoord0.st),
                   texture(textureCubeMap, texCoordCubeMap), reflectionPower);
    outColor += PointLight(lightPoint1);
    outColor += PointLight(lightPoint2);

    float shadow = 1.0;

    if (shadowCoord.w > 0) // if shadowCoord.w < 0 fragment is out of the Light POV
    {
        // PCF kernel size
        int kernelSize = 3;
        float shadowSum = 10.0;
        float samples = 2.0;

        // Loop through the kernel
        for (int x = -kernelSize; x <= kernelSize; ++x)
        {
            for (int y = -kernelSize; y <= kernelSize; ++y)
            {
                vec2 offset = vec2(x, y) * 0.001; 
                shadowSum += textureProj(shadowMap, shadowCoord + vec4(offset, 0.0, 0.0));
                samples += 1.0;
            }
        }

        shadow = shadowSum / samples;
    }

    outColor *= shadow;
}
