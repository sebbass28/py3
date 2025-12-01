"use client"

import { useState } from "react"
import { Clock, History, LogOut, Play, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useAuth } from "@/context/auth-context"

export default function EmployeeDashboard() {
  const { logout, user } = useAuth()
  const [isWorking, setIsWorking] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const handleClockAction = () => {
    if (isWorking) {
      // Clock Out logic
      setIsWorking(false)
      setStartTime(null)
    } else {
      // Clock In logic
      setIsWorking(true)
      setStartTime(new Date())
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Mi Panel</h1>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Clock In/Out Card */}
        <Card className="col-span-4 border-none shadow-md sm:border">
          <CardHeader>
            <CardTitle>Control de Tiempo</CardTitle>
            <CardDescription>
              Registra tu entrada y salida laboral
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 py-10">
            <div className="text-center">
              <div className="text-5xl font-bold tracking-tighter tabular-nums">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString([], {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <Button
              size="lg"
              className={`h-48 w-48 rounded-full text-xl font-bold shadow-lg transition-all hover:scale-105 ${
                isWorking
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-primary hover:bg-primary/90"
              }`}
              onClick={handleClockAction}
            >
              <div className="flex flex-col items-center gap-2">
                {isWorking ? (
                  <>
                    <Square className="h-10 w-10 fill-current" />
                    SALIDA
                  </>
                ) : (
                  <>
                    <Play className="h-10 w-10 fill-current" />
                    ENTRADA
                  </>
                )}
              </div>
            </Button>

            {isWorking && startTime && (
              <div className="animate-pulse text-sm font-medium text-primary">
                Trabajando desde las{" "}
                {startTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent History Card */}
        <Card className="col-span-3 border-none shadow-md sm:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Jornada Laboral
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ayer, 30 Nov
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">8h 00m</div>
                    <div className="text-xs text-muted-foreground">
                      09:00 - 17:00
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
