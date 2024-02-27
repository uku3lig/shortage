{
  inputs = {
    nixpkgs.url = "nixpkgs";

    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
  };

  outputs = {flake-parts, ...} @ inputs:
    flake-parts.lib.mkFlake {inherit inputs;} {
      systems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];

      perSystem = {
        lib,
        pkgs,
        ...
      }: {
        devShells.default = with pkgs;
          mkShell {
            buildInputs = [
              nodejs
              nodePackages.pnpm
            ];

            packages = [nil nrr];
          };

        formatter = pkgs.alejandra;
      };
    };
}
