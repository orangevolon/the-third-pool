declare type VertexShader = string;
declare type FragmentShader = string;

declare module '*.vs' {
  const value: VertexShader;
  export default value;
}

declare module '*.fs' {
  const value: FragmentShader;
  export default value;
}
