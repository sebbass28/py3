"""Generate a simple dental-crown-like STL demo model (torus shape)."""
import struct, math, os

def generate_crown_stl(filepath, R=5.0, r=2.0, N=48, M=24):
    """
    Create a torus STL that resembles a dental crown.
    R = major radius (ring centre to torus centre)
    r = minor radius (tube radius)
    N = segments around the ring
    M = segments around the tube
    """
    triangles = []

    def vertex(i, j):
        theta = 2 * math.pi * i / N
        phi   = 2 * math.pi * j / M
        x = (R + r * math.cos(phi)) * math.cos(theta)
        y = (R + r * math.cos(phi)) * math.sin(theta)
        z = r * math.sin(phi)
        return (x, y, z)

    def normal(v0, v1, v2):
        # cross product of (v1-v0) x (v2-v0)
        ux, uy, uz = v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]
        vx, vy, vz = v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]
        nx = uy*vz - uz*vy
        ny = uz*vx - ux*vz
        nz = ux*vy - uy*vx
        ln = math.sqrt(nx*nx + ny*ny + nz*nz) or 1
        return (nx/ln, ny/ln, nz/ln)

    for i in range(N):
        for j in range(M):
            v0 = vertex(i, j)
            v1 = vertex(i+1, j)
            v2 = vertex(i+1, j+1)
            v3 = vertex(i, j+1)
            n1 = normal(v0, v1, v2)
            n2 = normal(v0, v2, v3)
            triangles.append((n1, v0, v1, v2))
            triangles.append((n2, v0, v2, v3))

    # Write binary STL
    with open(filepath, 'wb') as f:
        f.write(b'\x00' * 80)                    # header
        f.write(struct.pack('<I', len(triangles))) # triangle count
        for (n, v0, v1, v2) in triangles:
            f.write(struct.pack('<3f', *n))
            f.write(struct.pack('<3f', *v0))
            f.write(struct.pack('<3f', *v1))
            f.write(struct.pack('<3f', *v2))
            f.write(struct.pack('<H', 0))          # attribute byte count

    print(f"Wrote {len(triangles)} triangles -> {filepath}  ({os.path.getsize(filepath)} bytes)")

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'static', 'models', 'Crown.stl')
    generate_crown_stl(os.path.abspath(out))
