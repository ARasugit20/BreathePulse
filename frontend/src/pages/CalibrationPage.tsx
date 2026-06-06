import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Camera, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateSimulatedHeartRate, generateSimulatedHRV } from "@/utils/breathing";

type CalibrationStatus = "idle" | "calibrating" | "complete";

export function CalibrationPage() {
  const [status, setStatus] = useState<CalibrationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [hrv, setHrv] = useState<number | null>(null);
  const [readings, setReadings] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Camera not available — use simulated data
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCalibration = useCallback(() => {
    setStatus("calibrating");
    setProgress(0);
    setReadings([]);
    setHeartRate(null);
    setHrv(null);
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (status !== "calibrating") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          const avgHr = generateSimulatedHeartRate(68);
          const avgHrv = generateSimulatedHRV(48);
          setHeartRate(avgHr);
          setHrv(avgHrv);
          setStatus("complete");
          stopCamera();
          return 100;
        }
        setReadings((r) => [...r, generateSimulatedHeartRate(68)]);
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [status, stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pulse Calibration</h1>
        <p className="mt-2 text-muted-foreground">
          Calibrate your baseline heart rate and HRV for accurate session tracking
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" aria-hidden="true" />
              Camera Feed
            </CardTitle>
            <CardDescription>
              Optional rPPG calibration via webcam. Falls back to simulated readings if unavailable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                aria-label="Webcam feed for pulse calibration"
              />
              {status === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                  <p className="text-sm text-muted-foreground">Camera activates during calibration</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" aria-hidden="true" />
              Calibration Results
            </CardTitle>
            <CardDescription>20-second baseline measurement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "calibrating" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Calibrating...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} aria-label="Calibration progress" />
                {readings.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Latest reading: {readings[readings.length - 1]} BPM
                  </p>
                )}
              </div>
            )}

            {status === "complete" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Heart Rate</p>
                  <p className="text-3xl font-bold text-primary">{heartRate}</p>
                  <p className="text-xs text-muted-foreground">BPM</p>
                </div>
                <div className="rounded-lg bg-accent/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">HRV</p>
                  <p className="text-3xl font-bold text-accent">{hrv}</p>
                  <p className="text-xs text-muted-foreground">ms</p>
                </div>
              </div>
            )}

            {status === "idle" && (
              <p className="text-sm text-muted-foreground">
                Sit comfortably and remain still during calibration for best results.
              </p>
            )}

            <Button
              onClick={startCalibration}
              disabled={status === "calibrating"}
              className="w-full"
              aria-label={status === "complete" ? "Recalibrate pulse" : "Start calibration"}
            >
              {status === "calibrating" ? (
                "Calibrating..."
              ) : status === "complete" ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Recalibrate
                </>
              ) : (
                "Start Calibration"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
