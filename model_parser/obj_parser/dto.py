from dataclasses import dataclass, field


@dataclass
class Coordinate3D:
    x: float
    y: float
    z: float


@dataclass
class Coordinate2D:
    x: float
    y: float


@dataclass
class PointDescription:
    vertex: int
    texture: int | None = None
    normal: int | None = None


@dataclass
class Face:
    point_descriptions: list[PointDescription] = field(default_factory=list)  # []


